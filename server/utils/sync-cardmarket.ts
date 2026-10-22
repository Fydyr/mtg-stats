import { BoosterType } from '@prisma/client'

export function cardmarketSlugify(name: string): string {
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

export interface CmProduct {
  idProduct: number
  name: string
  idCategory: number
  categoryName?: string
  idExpansion?: number
}

export interface CmPriceGuide {
  idProduct: number
  idCategory?: number
  avg?: number | null
  low?: number | null
  trend?: number | null
}

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

/**
 * Synchronise l'ensemble du catalogue des boîtes scellées et les prix depuis Cardmarket S3.
 */
export async function syncCardmarketData(
  targetMonth?: string,
  priceFieldChoice: 'trend' | 'low' | 'avg' = 'low'
) {
  const month =
    targetMonth && /^\d{4}-\d{2}$/.test(targetMonth)
      ? targetMonth
      : new Date().toISOString().slice(0, 7)

  console.log(`[Cardmarket Sync] Démarrage synchro S3 pour le mois ${month} (${priceFieldChoice})...`)

  // Téléchargement direct depuis le CDN public Cardmarket S3
  const [prodsData, pricesData] = await Promise.all([
    $fetch<{ version: string; products: CmProduct[] }>(
      'https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_1.json'
    ),
    $fetch<{ version: string; priceGuides: CmPriceGuide[] }>(
      'https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_1.json'
    )
  ])

  if (!prodsData?.products || !pricesData?.priceGuides) {
    throw new Error('Réponse invalide du CDN Cardmarket S3')
  }

  // Filtrer uniquement les vraies boîtes de boosters (Catégorie 7 Magic Display)
  const boxes = prodsData.products.filter((p) => {
    if (p.idCategory !== 7) return false
    const n = p.name.toLowerCase()
    return !JUNK_KEYWORDS.some((j) => n.includes(j))
  })

  // Map des prix par idProduct
  const priceMap = new Map<number, CmPriceGuide>()
  for (const pr of pricesData.priceGuides) {
    priceMap.set(pr.idProduct, pr)
  }

  let totalProducts = 0
  let totalPrices = 0

  for (const box of boxes) {
    const rawName = box.name.trim()
    if (!rawName) continue

    const { editionName, type } = parseBoosterBoxName(rawName)

    // Upsert du produit avec cardmarketId
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

    // Enregistrement du prix
    const pg = priceMap.get(box.idProduct)
    if (pg) {
      let chosenPrice: number | null = null
      if (priceFieldChoice === 'low' && pg.low && pg.low > 0) chosenPrice = pg.low
      else if (priceFieldChoice === 'avg' && pg.avg && pg.avg > 0) chosenPrice = pg.avg
      else if (priceFieldChoice === 'trend' && pg.trend && pg.trend > 0) chosenPrice = pg.trend

      // Fallback si le prix choisi n'est pas renseigné
      if (!chosenPrice || chosenPrice <= 0) {
        if (priceFieldChoice === 'low') {
          if (pg.low && pg.low > 0) chosenPrice = pg.low
          else if (pg.trend && pg.trend > 0) chosenPrice = pg.trend
          else if (pg.avg && pg.avg > 0) chosenPrice = pg.avg
        } else {
          if (pg.trend && pg.trend > 0) chosenPrice = pg.trend
          else if (pg.low && pg.low > 0) chosenPrice = pg.low
          else if (pg.avg && pg.avg > 0) chosenPrice = pg.avg
        }
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

  console.log(`[Cardmarket Sync] Terminé : ${totalProducts} boîtes traitées, ${totalPrices} prix enregistrés pour ${month}.`)

  return {
    ok: true,
    month,
    productsCount: totalProducts,
    pricesCount: totalPrices
  }
}
