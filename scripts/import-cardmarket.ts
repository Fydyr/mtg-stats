import { readFileSync, existsSync } from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { PrismaClient, BoosterType } from '@prisma/client'

const prisma = new PrismaClient()

function decompressIfNeeded(buffer: Buffer): string {
  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    return gunzipSync(buffer).toString('utf-8')
  }
  return buffer.toString('utf-8')
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

function parseBoosterBoxName(rawName: string): { editionName: string; type: BoosterType } {
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

async function syncFromS3(month: string, priceFieldChoice: string) {
  console.log(`[Cardmarket CLI] Téléchargement direct depuis le CDN public Cardmarket S3...`)
  const [prodsRes, pricesRes] = await Promise.all([
    fetch('https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_1.json'),
    fetch('https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_1.json')
  ])

  if (!prodsRes.ok || !pricesRes.ok) {
    throw new Error(`Erreur HTTP S3: Prods=${prodsRes.status}, Prices=${pricesRes.status}`)
  }

  const prodsData = (await prodsRes.json()) as { products: any[] }
  const pricesData = (await pricesRes.json()) as { priceGuides: any[] }

  const JUNK_KEYWORDS = [
    'theme deck',
    'intro pack',
    'tournament pack',
    'event deck',
    'gift box',
    'holiday',
    'battle pack',
    'prerelease',
    'guild kit',
    'toolkit',
    'mythic edition',
    'faction pack',
    'preconstructed'
  ]

  const boxes = prodsData.products.filter((p: any) => {
    if (p.idCategory !== 7) return false
    const n = (p.name || '').toLowerCase()
    return !JUNK_KEYWORDS.some((j) => n.includes(j))
  })

  const priceMap = new Map<number, any>()
  for (const pr of pricesData.priceGuides) {
    priceMap.set(pr.idProduct, pr)
  }

  let totalProducts = 0
  let totalPrices = 0

  for (const box of boxes) {
    const rawName = box.name.trim()
    if (!rawName) continue

    const { editionName, type } = parseBoosterBoxName(rawName)

    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { cardmarketId: box.idProduct },
          { name: editionName, type }
        ]
      }
    })

    let product
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          cardmarketId: box.idProduct,
          type: existing.type || type
        }
      })
    } else {
      product = await prisma.product.create({
        data: {
          name: editionName,
          type,
          cardmarketId: box.idProduct
        }
      })
    }
    totalProducts++

    const pg = priceMap.get(box.idProduct)
    if (pg) {
      let chosenPrice: number | null = null
      if (priceFieldChoice === 'low' && pg.low && pg.low > 0) chosenPrice = pg.low
      else if (priceFieldChoice === 'avg' && pg.avg && pg.avg > 0) chosenPrice = pg.avg
      else if (pg.trend && pg.trend > 0) chosenPrice = pg.trend

      if (!chosenPrice || chosenPrice <= 0) {
        if (pg.trend && pg.trend > 0) chosenPrice = pg.trend
        else if (pg.low && pg.low > 0) chosenPrice = pg.low
      }

      if (chosenPrice && Number.isFinite(chosenPrice) && chosenPrice > 0) {
        await prisma.priceSnapshot.upsert({
          where: { productId_month: { productId: product.id, month } },
          update: { price: chosenPrice },
          create: { productId: product.id, month, price: chosenPrice }
        })
        totalPrices++
      }
    }
  }

  console.log(`[Cardmarket CLI] Synchro terminée avec succès : ${totalProducts} boîtes traitées, ${totalPrices} prix enregistrés pour ${month}.`)
}

async function main() {
  const args = process.argv.slice(2)
  const getArg = (key: string) => {
    const idx = args.indexOf(key)
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : null
  }

  const productsPath = getArg('--products')
  const pricesPath = getArg('--prices')
  const month = getArg('--month') || new Date().toISOString().slice(0, 7)
  const priceField = getArg('--field') || 'low'

  console.log(`[Cardmarket CLI] Mois cible: ${month}, Champ de prix: ${priceField}`)

  // Si des fichiers locaux sont spécifiés
  if (productsPath || pricesPath) {
    console.log('[Cardmarket CLI] Mode fichiers locaux activé')
    // Traitement local
  } else {
    // Mode automatique direct S3
    await syncFromS3(month, priceField)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error('[Cardmarket CLI] Erreur :', e)
  process.exit(1)
})
