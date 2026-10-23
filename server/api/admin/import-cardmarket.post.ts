import { gunzipSync } from 'node:zlib'
import { BoosterType } from '@prisma/client'

function decompressIfNeeded(buffer: Buffer): string {
  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return gunzipSync(buffer).toString('utf-8')
  }
  return buffer.toString('utf-8')
}

function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (!lines.length) return []
  const first = lines[0]!
  const sep = first.split(';').length > first.split(',').length ? ';' : ','

  return lines.map((line) => {
    const out: string[] = []
    let cur = ''
    let quoted = false
    for (let i = 0; i < line.length; i++) {
      const ch = line[i]
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          cur += '"'
          i++
        } else {
          quoted = !quoted
        }
      } else if (ch === sep && !quoted) {
        out.push(cur.trim())
        cur = ''
      } else {
        cur += ch
      }
    }
    out.push(cur.trim())
    return out
  })
}

function cardmarketSlugify(name: string): string {
  return name
    .replace(/['’]/g, '')
    .replace(/[/:&+,.]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

export function parseBoosterBoxName(rawName: string): { editionName: string; type: BoosterType } {
  let name = rawName.trim()
  let type: BoosterType = BoosterType.DRAFT

  if (/\bcollector(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.COLLECTOR
    name = name.replace(/\bcollector(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bplay(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.PLAY
    name = name.replace(/\bplay(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bset(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.SET
    name = name.replace(/\bset(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bdraft(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.DRAFT
    name = name.replace(/\bdraft(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bjumpstart\b/i.test(name)) {
    type = BoosterType.OTHER
    name = name.replace(/\bbooster(?:\s+box)?\b/gi, '').trim()
  } else {
    type = BoosterType.DRAFT
    name = name.replace(/\bbooster(?:\s+box)?\b/gi, '').trim()
  }

  name = name.replace(/[-–—:]+$/, '').trim()
  if (!name) name = rawName.trim()

  return { editionName: name, type }
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const parts = await readMultipartFormData(event)
  if (!parts || !parts.length) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun fichier fourni' })
  }

  let targetMonth = new Date().toISOString().slice(0, 7)
  let priceFieldChoice = 'trend' // 'trend' | 'low' | 'avg'

  const files: { filename: string; content: string }[] = []

  for (const part of parts) {
    if (part.name === 'month' && part.data) {
      const m = part.data.toString('utf-8').trim()
      if (/^\d{4}-\d{2}$/.test(m)) targetMonth = m
    } else if (part.name === 'priceField' && part.data) {
      priceFieldChoice = part.data.toString('utf-8').trim().toLowerCase()
    } else if (part.filename && part.data) {
      try {
        const text = decompressIfNeeded(part.data)
        files.push({ filename: part.filename, content: text })
      } catch (err: any) {
        throw createError({
          statusCode: 400,
          statusMessage: `Impossible de décompresser ${part.filename} : ${err?.message}`
        })
      }
    }
  }

  if (!files.length) {
    throw createError({ statusCode: 400, statusMessage: 'Aucun fichier CSV ou GZ valide trouvé' })
  }

  let productsFileContent: string | null = null
  let priceguideFileContent: string | null = null

  for (const f of files) {
    const fn = f.filename.toLowerCase()
    if (fn.includes('products') || fn.includes('nonsingles')) {
      productsFileContent = f.content
    } else if (fn.includes('priceguide') || fn.includes('price')) {
      priceguideFileContent = f.content
    } else {
      // Détection automatique basée sur les en-têtes
      const firstLine = f.content.split(/\r?\n/)[0] || ''
      if (firstLine.includes('TrendPrice') || firstLine.includes('AvgSell')) {
        priceguideFileContent = f.content
      } else if (firstLine.includes('idCategory') || firstLine.includes('Category Name')) {
        productsFileContent = f.content
      }
    }
  }

  let importedProducts = 0
  let updatedProducts = 0
  let importedPrices = 0

  // 1. Traitement de products_nonsingles si présent
  if (productsFileContent) {
    const rows = parseCsv(productsFileContent)
    if (rows.length > 1) {
      const header = rows[0]!.map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase())
      const idIdx = header.findIndex((h) => h === 'idproduct' || h === 'id')
      const nameIdx = header.findIndex((h) => h === 'name' || h === 'nom')
      const catIdIdx = header.findIndex((h) => h === 'idcategory')
      const catNameIdx = header.findIndex((h) => h === 'category name' || h === 'category')

      if (idIdx !== -1 && nameIdx !== -1) {
        for (const row of rows.slice(1)) {
          const rawId = row[idIdx]?.replace(/\D/g, '')
          if (!rawId) continue
          const cardmarketId = parseInt(rawId, 10)
          const rawName = row[nameIdx]?.trim()
          if (!rawName) continue

          // Filtrer uniquement les Booster Boxes (Catégorie 3 sur Cardmarket ou nom contenant Booster Box)
          const catId = catIdIdx !== -1 ? row[catIdIdx]?.trim() : ''
          const catName = catNameIdx !== -1 ? row[catNameIdx]?.toLowerCase() : ''
          const isBoosterBox =
            catId === '3' ||
            catName.includes('booster box') ||
            catName.includes('display') ||
            /booster\s*box/i.test(rawName)

          if (!isBoosterBox) continue

          const { editionName, type } = parseBoosterBoxName(rawName)
          const slug = cardmarketSlugify(rawName)
          const cardmarketUrl = `https://www.cardmarket.com/fr/Magic/Products/Booster-Boxes/${slug}`

          // Vérifier si un produit existe déjà par cardmarketId ou par name/type
          const existing = await prisma.product.findFirst({
            where: {
              OR: [
                { cardmarketId },
                { name: editionName, type }
              ]
            }
          })

          if (existing) {
            await prisma.product.update({
              where: { id: existing.id },
              data: {
                cardmarketId,
                cardmarketUrl: existing.cardmarketUrl || cardmarketUrl,
                type: existing.type || type
              }
            })
            updatedProducts++
          } else {
            await prisma.product.create({
              data: {
                name: editionName,
                type,
                cardmarketId,
                cardmarketUrl
              }
            })
            importedProducts++
          }
        }
      }
    }
  }

  // 2. Traitement de priceguide si présent
  if (priceguideFileContent) {
    const rows = parseCsv(priceguideFileContent)
    if (rows.length > 1) {
      const header = rows[0]!.map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase())
      const idIdx = header.findIndex((h) => h === 'idproduct' || h === 'id')
      const trendIdx = header.findIndex((h) => h === 'trendprice' || h === 'trend')
      const lowIdx = header.findIndex((h) => h === 'lowprice' || h === 'low')
      const avgIdx = header.findIndex((h) => h === 'avgsell' || h === 'avg')
      const stockIdx = header.findIndex((h) =>
        h === 'countarticles' || h === 'articles' || h === 'amount' || h === 'stock' || h === 'available' || h === 'quantite' || h === 'disponible'
      )

      if (idIdx !== -1) {
        // Pré-charger tous les produits ayant un cardmarketId
        const allProducts = await prisma.product.findMany({
          where: { cardmarketId: { not: null } },
          select: { id: true, cardmarketId: true }
        })
        const productMap = new Map<number, number>()
        for (const p of allProducts) {
          if (p.cardmarketId) productMap.set(p.cardmarketId, p.id)
        }

        for (const row of rows.slice(1)) {
          const rawId = row[idIdx]?.replace(/\D/g, '')
          if (!rawId) continue
          const cardmarketId = parseInt(rawId, 10)

          const productId = productMap.get(cardmarketId)
          if (!productId) continue

          if (stockIdx !== -1) {
            const rawStock = row[stockIdx]?.replace(/\D/g, '')
            if (rawStock) {
              const stockNum = parseInt(rawStock, 10)
              if (!isNaN(stockNum)) {
                await prisma.product.update({
                  where: { id: productId },
                  data: { stock: stockNum }
                })
              }
            }
          }

          let chosenPrice: number | null = null
          const rawTrend = trendIdx !== -1 ? row[trendIdx]?.replace(',', '.') : null
          const rawLow = lowIdx !== -1 ? row[lowIdx]?.replace(',', '.') : null
          const rawAvg = avgIdx !== -1 ? row[avgIdx]?.replace(',', '.') : null

          if (priceFieldChoice === 'low' && rawLow) chosenPrice = parseFloat(rawLow)
          else if (priceFieldChoice === 'avg' && rawAvg) chosenPrice = parseFloat(rawAvg)
          else if (rawTrend) chosenPrice = parseFloat(rawTrend)

          // Fallbacks si le prix choisi est 0 ou invalide
          if (!chosenPrice || chosenPrice <= 0) {
            if (rawTrend && parseFloat(rawTrend) > 0) chosenPrice = parseFloat(rawTrend)
            else if (rawLow && parseFloat(rawLow) > 0) chosenPrice = parseFloat(rawLow)
            else if (rawAvg && parseFloat(rawAvg) > 0) chosenPrice = parseFloat(rawAvg)
          }

          if (chosenPrice && Number.isFinite(chosenPrice) && chosenPrice > 0) {
            await prisma.priceSnapshot.upsert({
              where: {
                productId_month: {
                  productId,
                  month: targetMonth
                }
              },
              update: { price: chosenPrice },
              create: {
                productId,
                month: targetMonth,
                price: chosenPrice
              }
            })
            importedPrices++
          }
        }
      }
    }
  }

  return {
    ok: true,
    month: targetMonth,
    importedProducts,
    updatedProducts,
    importedPrices
  }
})
