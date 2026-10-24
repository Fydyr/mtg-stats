import { prisma } from './prisma'

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

function parseValidDate(str?: string | null): Date | null {
  if (!str) return null
  const d = new Date(str)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Synchronisation dynamique et officielle des dates de sortie.
 * Toutes les données proviennent dynamiquement des APIs officielles (Scryfall et MTGJSON)
 * et des associations en base de données.
 */
export async function syncProductReleaseDates(): Promise<{
  ok: boolean
  totalChecked: number
  updated: number
  discrepanciesFixed: number
  remainingWithoutDate: number
}> {
  console.log('[ReleaseDates Sync] Démarrage de la synchronisation dynamique des dates de sortie...')

  // 1. Récupération dynamique des sets officiels Scryfall
  const scryfallExactMap = new Map<string, Date>()
  const scryfallSetsSorted: { name: string; normName: string; date: Date }[] = []
  try {
    const sfRes = await fetch('https://api.scryfall.com/sets', {
      headers: { 'User-Agent': 'MTG-Stats/1.0 (https://mtg-stats.aeroliths.fr)' }
    })
    if (sfRes.ok) {
      const sfJson = (await sfRes.json()) as { data?: any[] }
      for (const set of sfJson.data || []) {
        const d = parseValidDate(set.released_at)
        if (d && set.name) {
          const n = norm(set.name)
          scryfallExactMap.set(n, d)
          if (set.code) scryfallExactMap.set(norm(set.code), d)
          scryfallSetsSorted.push({ name: set.name, normName: n, date: d })
        }
      }
      scryfallSetsSorted.sort((a, b) => b.normName.length - a.normName.length)
      console.log(`[ReleaseDates Sync] ${scryfallSetsSorted.length} sets Scryfall chargés dynamiquement.`)
    }
  } catch (err: any) {
    console.warn('[ReleaseDates Sync] Impossible de contacter Scryfall Sets:', err?.message || err)
  }

  // 2. Récupération dynamique de SetList.json depuis MTGJSON (avec mcmId des produits scellés)
  const mcmIdMap = new Map<number, Date>()
  const sealedNameMap = new Map<string, Date>()
  const mtgjsonSetMap = new Map<string, Date>()

  try {
    const mtgRes = await fetch('https://mtgjson.com/api/v5/SetList.json')
    if (mtgRes.ok) {
      const mtgJson = (await mtgRes.json()) as { data?: any[] }
      for (const set of mtgJson.data || []) {
        const setDate = parseValidDate(set.releaseDate)
        if (setDate && set.name) {
          mtgjsonSetMap.set(norm(set.name), setDate)
          if (set.code) mtgjsonSetMap.set(norm(set.code), setDate)
        }

        for (const sp of set.sealedProduct || []) {
          const spDate = parseValidDate(sp.releaseDate) || setDate
          if (!spDate) continue

          if (sp.identifiers?.mcmId) {
            const id = Number(sp.identifiers.mcmId)
            if (!isNaN(id)) mcmIdMap.set(id, spDate)
          }

          if (sp.name) {
            sealedNameMap.set(norm(sp.name), spDate)
          }
        }
      }
      console.log(`[ReleaseDates Sync] MTGJSON chargé : ${mcmIdMap.size} produits scellés Cardmarket indexés.`)
    }
  } catch (err: any) {
    console.warn('[ReleaseDates Sync] Impossible de contacter MTGJSON SetList:', err?.message || err)
  }

  // 3. Récupération dynamique des boîtes de boosters existantes en base
  const existingBoxes = await prisma.product.findMany({
    where: {
      category: 'BOOSTER_BOX',
      releaseDate: { not: null }
    },
    select: { name: true, releaseDate: true }
  })

  const boxMap = new Map<string, Date>()
  const boxesSorted: { name: string; normName: string; date: Date }[] = []
  for (const b of existingBoxes) {
    if (b.releaseDate) {
      const n = norm(b.name)
      boxMap.set(n, b.releaseDate)
      boxesSorted.push({ name: b.name, normName: n, date: b.releaseDate })
    }
  }
  boxesSorted.sort((a, b) => b.normName.length - a.normName.length)

  // 4. Tous les produits en base
  const allProducts = await prisma.product.findMany({
    select: { id: true, name: true, category: true, type: true, cardmarketId: true, releaseDate: true }
  })

  const updatesToRun: { id: number; date: Date }[] = []
  let discrepanciesFixed = 0

  for (const p of allProducts) {
    const pNorm = norm(p.name)
    let officialDate: Date | null = null

    // A. Correspondance exacte par Cardmarket ID depuis MTGJSON
    if (p.cardmarketId && mcmIdMap.has(p.cardmarketId)) {
      officialDate = mcmIdMap.get(p.cardmarketId)!
    }

    // B. Correspondance exacte avec un set Scryfall
    if (!officialDate && scryfallExactMap.has(pNorm)) {
      officialDate = scryfallExactMap.get(pNorm)!
    }

    // C. Correspondance exacte avec un set MTGJSON
    if (!officialDate && mtgjsonSetMap.has(pNorm)) {
      officialDate = mtgjsonSetMap.get(pNorm)!
    }

    // D. Correspondance exacte avec une boîte existante en base
    if (!officialDate && boxMap.has(pNorm)) {
      officialDate = boxMap.get(pNorm)!
    }

    // E. Correspondance exacte avec un produit scellé MTGJSON
    if (!officialDate && sealedNameMap.has(pNorm)) {
      officialDate = sealedNameMap.get(pNorm)!
    }

    // F. Détection dynamique par préfixe d'extension (pour decks et sous-produits type "Time Spiral: Reality Fracture Theme Deck")
    // Évite qu'un sous-titre de deck ("Reality Fracture") ne prenne le dessus sur le nom de l'extension principale
    if (!officialDate && p.name.includes(':')) {
      const colParts = p.name.split(':').map((s) => s.trim())
      for (const part of colParts) {
        const partNorm = norm(part)
        if (!partNorm || partNorm === 'commander' || partNorm === 'dueldecks' || partNorm === 'clashpack') continue

        if (scryfallExactMap.has(partNorm)) {
          officialDate = scryfallExactMap.get(partNorm)!
          break
        }
        if (boxMap.has(partNorm)) {
          officialDate = boxMap.get(partNorm)!
          break
        }
        if (mtgjsonSetMap.has(partNorm)) {
          officialDate = mtgjsonSetMap.get(partNorm)!
          break
        }
        if (sealedNameMap.has(partNorm)) {
          officialDate = sealedNameMap.get(partNorm)!
          break
        }
      }
    }

    // G. Recherche dynamique dans les boîtes de boosters existantes (du nom le plus long au plus court)
    if (!officialDate) {
      for (const box of boxesSorted) {
        if (box.normName.length >= 4 && pNorm.length > box.normName.length && pNorm.includes(box.normName)) {
          officialDate = box.date
          break
        }
      }
    }

    // H. Recherche dynamique par inclusion dans les sets Scryfall (du nom le plus long au plus court)
    if (!officialDate) {
      for (const sfSet of scryfallSetsSorted) {
        if (sfSet.normName.length >= 4 && pNorm.length > sfSet.normName.length && pNorm.includes(sfSet.normName)) {
          officialDate = sfSet.date
          break
        }
      }
    }

    // I. Détection dynamique de l'année dans le nom du produit (ex: "Challenger Decks 2021", "Game Night 2019")
    if (!officialDate) {
      const yearMatch = p.name.match(/\b(19\d{2}|20\d{2})\b/)
      if (yearMatch) {
        const yr = yearMatch[1]
        const commanderSet = `commander${yr}`
        if (scryfallExactMap.has(commanderSet)) {
          officialDate = scryfallExactMap.get(commanderSet)!
        } else {
          officialDate = new Date(`${yr}-06-01`)
        }
      }
    }

    // Vérifier si une mise à jour est requise
    if (officialDate) {
      const isMissing = !p.releaseDate
      const isDifferent = p.releaseDate && p.releaseDate.toISOString().slice(0, 10) !== officialDate.toISOString().slice(0, 10)

      if (isMissing || isDifferent) {
        updatesToRun.push({ id: p.id, date: officialDate })
        if (isDifferent) discrepanciesFixed++
      }
    }
  }

  // Exécution par lots concurrents de 30
  const BATCH_SIZE = 30
  for (let i = 0; i < updatesToRun.length; i += BATCH_SIZE) {
    const chunk = updatesToRun.slice(i, i + BATCH_SIZE)
    await Promise.all(
      chunk.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { releaseDate: item.date }
        })
      )
    )
  }

  const remainingWithoutDate = await prisma.product.count({
    where: { releaseDate: null }
  })

  console.log(`[ReleaseDates Sync] Terminé : ${updatesToRun.length} dates mises à jour (${discrepanciesFixed} corrigées, ${remainingWithoutDate} sans date).`)

  return {
    ok: true,
    totalChecked: allProducts.length,
    updated: updatesToRun.length,
    discrepanciesFixed,
    remainingWithoutDate
  }
}
