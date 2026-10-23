import { ProductCategory, BoosterType } from '@prisma/client'

/**
 * Normalise un nom d'édition pour la comparaison.
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\b(booster box|draft booster box|play booster box|set booster box|collector booster box|edition|box)\b/gi, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Correspondances spécifiques entre noms MTG Stats et noms Dawnglare.
 */
const SET_ALIASES: Record<string, string> = {
  'modern masters 2015': 'modern masters 2015',
  'modern masters 2017': 'modern masters 2017',
  'modern masters': 'modern masters',
  'double masters 2022': 'double masters 2022',
  'double masters': 'double masters',
  'conspiracy take the crown': 'conspiracy take the crown',
  'conspiracy': 'conspiracy',
  'commander legends battle for baldurs gate': 'battle for baldurs gate',
  'battle for baldurs gate': 'battle for baldurs gate',
  'adventures in the forgotten realms': 'forgotten realms',
  'the lord of the rings tales of middle earth': 'tales of middle earth',
  'march of the machine the aftermath': 'aftermath',
  'universes beyond assassins creed': 'assassins creed'
}

/**
 * Synchronise les Expected Values (EV) des boîtes de boosters depuis Dawnglare.
 */
export async function syncExpectedValues(targetMonth?: string) {
  const month = targetMonth || new Date().toISOString().slice(0, 7)
  console.log(`[EV Sync] Récupération des Expected Values pour ${month}...`)

  // 1. Nettoyage préalable : suppression des snapshots corrompus avec price <= 0
  await prisma.priceSnapshot.deleteMany({
    where: { price: { lte: 0 } }
  })

  // 2. Nettoyage des EV sur les sets vintage (< 2003) ou non-boîtes qui faussent les ratios
  const vintageProducts = await prisma.product.findMany({
    where: {
      OR: [
        { releaseDate: { lt: new Date('2003-01-01') } },
        { category: { not: ProductCategory.BOOSTER_BOX } },
        { type: BoosterType.COLLECTOR },
        { name: { in: ['Alpha', 'Beta', 'Unlimited', 'Arabian Nights', 'Antiquities', 'Legends', 'The Dark', 'Fallen Empires'] } }
      ]
    },
    select: { id: true }
  })
  if (vintageProducts.length) {
    await prisma.priceSnapshot.updateMany({
      where: { productId: { in: vintageProducts.map((p) => p.id) } },
      data: { ev: null }
    })
  }

  // 3. Récupération des données Dawnglare
  const html = await $fetch<string>('https://mtg.dawnglare.com/?p=sets', { responseType: 'text' })

  const regex = /<div class="cP"[^>]*>\$([\d,.]+)<\/div><div class="cN">(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/div>/gi
  const evMap = new Map<string, number>()
  const rawList: { rawName: string; norm: string; val: number }[] = []

  let m
  while ((m = regex.exec(html)) !== null) {
    const evVal = parseFloat(m[1].replace(/,/g, ''))
    const rawName = m[2].trim()
    const norm = normalizeName(rawName)
    if (evVal > 0 && norm) {
      evMap.set(norm, evVal)
      rawList.push({ rawName, norm, val: evVal })
    }
  }

  // Taux de conversion approximatif USD -> EUR
  const USD_TO_EUR = 0.92

  // 4. Filtrer uniquement les boîtes de boosters (Draft, Play, Set) modernes (>= 2003)
  const products = await prisma.product.findMany({
    where: {
      category: ProductCategory.BOOSTER_BOX,
      type: { in: [BoosterType.DRAFT, BoosterType.PLAY, BoosterType.SET] },
      OR: [
        { releaseDate: { gte: new Date('2003-01-01') } },
        { releaseDate: null }
      ]
    }
  })

  let matchedCount = 0

  for (const product of products) {
    // Exclure formellement les sets vintage célèbres sans boîte standard moderne
    const lowerName = product.name.trim().toLowerCase()
    if (['alpha', 'beta', 'unlimited', 'arabian nights', 'antiquities', 'legends', 'the dark'].includes(lowerName)) {
      continue
    }

    const normP = normalizeName(product.name)
    let evUsd = evMap.get(normP)

    // Alias explicite
    if (evUsd === undefined && SET_ALIASES[normP]) {
      evUsd = evMap.get(SET_ALIASES[normP])
    }

    // Appariement strict par mots-clés
    if (evUsd === undefined) {
      const pWords = normP.split(' ').filter(Boolean)
      const pNumbers = normP.match(/\d+/g) || []

      for (const item of rawList) {
        const dWords = item.norm.split(' ').filter(Boolean)
        const dNumbers = item.norm.match(/\d+/g) || []

        // Les années/numéros (ex: 2015, 2017, 2, 3) doivent impérativement concorder
        const numMatch = pNumbers.length === dNumbers.length && pNumbers.every((n) => dNumbers.includes(n))
        if (!numMatch) continue

        // Vérifier si tous les mots du plus court sont présents dans le plus long
        if (pWords.length >= 2 && dWords.length >= 2) {
          const matchAllP = pWords.every((w) => item.norm.includes(w))
          const matchAllD = dWords.every((w) => normP.includes(w))
          if (matchAllP || matchAllD) {
            evUsd = item.val
            break
          }
        }
      }
    }

    if (evUsd !== undefined && evUsd > 0 && evUsd < 2500) {
      const evEur = Math.round(evUsd * USD_TO_EUR * 100) / 100

      // Vérifier si un snapshot existe pour ce mois
      const snap = await prisma.priceSnapshot.findUnique({
        where: { productId_month: { productId: product.id, month } }
      })

      if (snap) {
        await prisma.priceSnapshot.update({
          where: { id: snap.id },
          data: { ev: evEur }
        })
        matchedCount++
      } else {
        // Ne jamais créer un snapshot avec prix 0 ! Récupérer le dernier prix réel
        const prevSnap = await prisma.priceSnapshot.findFirst({
          where: { productId: product.id, price: { gt: 0 } },
          orderBy: { month: 'desc' }
        })
        if (prevSnap) {
          await prisma.priceSnapshot.create({
            data: {
              productId: product.id,
              month,
              price: prevSnap.price,
              ev: evEur
            }
          })
          matchedCount++
        }
      }
    }
  }

  console.log(`[EV Sync] Terminé : ${matchedCount} boîtes associées avec leur EV pour ${month}.`)
  return { ok: true, month, matchedCount }
}
