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

export function parseSingleBoosterName(rawName: string): { editionName: string; type: BoosterType } {
  let name = rawName.trim()
  let type: BoosterType = BoosterType.DRAFT

  if (/\bcollector(?:\s+booster)?\b/i.test(name)) {
    type = BoosterType.COLLECTOR
    name = name.replace(/\bcollector(?:\s+booster)?\b/gi, '').trim()
  } else if (/\bplay(?:\s+booster)?\b/i.test(name)) {
    type = BoosterType.PLAY
    name = name.replace(/\bplay(?:\s+booster)?\b/gi, '').trim()
  } else if (/\bset(?:\s+booster)?\b/i.test(name)) {
    type = BoosterType.SET
    name = name.replace(/\bset(?:\s+booster)?\b/gi, '').trim()
  } else if (/\bdraft(?:\s+booster)?\b/i.test(name)) {
    type = BoosterType.DRAFT
    name = name.replace(/\bdraft(?:\s+booster)?\b/gi, '').trim()
  } else if (/\bjumpstart\b/i.test(name)) {
    type = BoosterType.OTHER
    name = name.replace(/\bbooster\b/gi, '').trim()
  } else {
    type = BoosterType.DRAFT
    name = name.replace(/\bbooster\b/gi, '').trim()
  }

  name = name.replace(/[-–—:]+$/, '').trim()
  if (!name) name = rawName.trim()
  return { editionName: name, type }
}

export function parsePreconDeckName(rawName: string): { name: string; deckType: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER' } {
  const lower = rawName.toLowerCase()
  let deckType: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER' = 'OTHER'

  if (lower.includes('commander')) {
    deckType = 'COMMANDER'
  } else if (lower.includes('challenger')) {
    deckType = 'CHALLENGER'
  } else if (lower.includes('starter') || lower.includes('intro pack') || lower.includes('game night')) {
    deckType = 'STARTER'
  }

  return { name: rawName.trim(), deckType }
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

  const itemsToSync: {
    idProduct: number
    name: string
    category: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'
    type: BoosterType
    deckType?: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER'
  }[] = []

  for (const p of prodsData.products) {
    const raw = (p.name || '').trim()
    if (!raw) continue
    const lower = raw.toLowerCase()

    const isBundleOrFatPack =
      /\b(?:bundle|fat\s*pack|fatpack)\b/i.test(raw) ||
      (Boolean((p as any).categoryName) && /bundle|fat\s*pack/i.test((p as any).categoryName!))

    if (isBundleOrFatPack && !JUNK_KEYWORDS.some((j) => lower.includes(j))) {
      itemsToSync.push({ idProduct: p.idProduct, name: raw, category: 'BOOSTER_BOX', type: BoosterType.OTHER })
    } else if (p.idCategory === 7 && !JUNK_KEYWORDS.some((j) => lower.includes(j))) {
      const { editionName, type } = parseBoosterBoxName(raw)
      itemsToSync.push({ idProduct: p.idProduct, name: editionName, category: 'BOOSTER_BOX', type })
    } else if (p.idCategory === 2 && !JUNK_KEYWORDS.some((j) => lower.includes(j))) {
      const { editionName, type } = parseSingleBoosterName(raw)
      itemsToSync.push({ idProduct: p.idProduct, name: editionName, category: 'SINGLE_BOOSTER', type })
    } else if (
      (p.idCategory === 18 || p.idCategory === 32) &&
      (lower.includes('deck') || lower.includes('commander') || lower.includes('challenger') || lower.includes('starter') || lower.includes('intro pack'))
    ) {
      const { name, deckType } = parsePreconDeckName(raw)
      itemsToSync.push({ idProduct: p.idProduct, name, category: 'PRECON_DECK', type: 'OTHER' as BoosterType, deckType })
    }
  }

  const priceMap = new Map<number, any>()
  for (const pr of pricesData.priceGuides) {
    priceMap.set(pr.idProduct, pr)
  }

  let totalProducts = 0
  let totalPrices = 0

  for (const item of itemsToSync) {
    const existing = await prisma.product.findFirst({
      where: {
        OR: [
          { cardmarketId: item.idProduct },
          { name: item.name, category: item.category as any, type: item.type }
        ]
      }
    })

    let product
    if (existing) {
      product = await prisma.product.update({
        where: { id: existing.id },
        data: {
          cardmarketId: item.idProduct,
          category: (item.category as any) || (existing as any).category,
          type: existing.type || item.type,
          deckType: (item.deckType as any) || (existing as any).deckType
        }
      })
    } else {
      product = await prisma.product.create({
        data: {
          name: item.name,
          category: item.category as any,
          type: item.type,
          deckType: item.deckType as any,
          cardmarketId: item.idProduct
        }
      })
    }
    totalProducts++

    const pg = priceMap.get(item.idProduct)
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

  console.log(`[Cardmarket CLI] Synchro terminée avec succès : ${totalProducts} produits traités (${itemsToSync.length} éligibles), ${totalPrices} prix enregistrés pour ${month}.`)
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
