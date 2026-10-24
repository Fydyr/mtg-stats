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

// Table de dates pour kits et produits autonomes courants
const KNOWN_DATES: Record<string, string> = {
  '2021arenastarterkit': '2021-08-10',
  '2022starterkit': '2022-07-08',
  '2023starterkit': '2023-09-08',
  '30thanniversaryedition': '2022-11-28',
  'startercommanderdecks': '2022-12-02',
  'pioneerchallengerdecks2021': '2021-10-15',
  'pioneerchallengerdecks2022': '2022-11-04',
  'challengerdecks2018': '2018-04-06',
  'challengerdecks2019': '2019-04-12',
  'challengerdecks2020': '2020-04-03',
  'challengerdecks2021': '2021-04-02',
  'challengerdecks2022': '2022-04-01',
  'gamenight': '2018-11-16',
  'gamenight2019': '2019-11-15',
  'gamenightfreeforall': '2022-10-14',
  'finalfantasybasic': '2025-06-13',
  'finalfantasy': '2025-06-13',
  'aetherdrift': '2025-02-14',
  'edgeofeternities': '2025-08-01',
  'lorwyneclipsed': '2026-01-01',
  'thehobbit': '2025-11-01',
  'avatarthelastairbender': '2025-09-01',
  'moodswing': '2000-01-01'
}

export async function syncProductReleaseDates(): Promise<{
  totalChecked: number
  updated: number
  remainingWithoutDate: number
}> {
  console.log('[ReleaseDates Sync] Démarrage de la synchronisation des dates de sortie...')

  // 1. Récupération des boîtes de boosters existantes ayant déjà une date de sortie
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
  // Trier par nom le plus long en premier pour éviter les faux positifs partiels
  boxesSorted.sort((a, b) => b.normName.length - a.normName.length)

  // 2. Récupération des sets Scryfall
  const scryfallMap = new Map<string, Date>()
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
          scryfallMap.set(n, d)
          if (set.code) scryfallMap.set(norm(set.code), d)
          scryfallSetsSorted.push({ name: set.name, normName: n, date: d })
        }
      }
      scryfallSetsSorted.sort((a, b) => b.normName.length - a.normName.length)
    }
  } catch (err: any) {
    console.warn('[ReleaseDates Sync] Impossible de contacter Scryfall Sets:', err?.message || err)
  }

  // 3. Récupération de SetList.json depuis MTGJSON
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
    }
  } catch (err: any) {
    console.warn('[ReleaseDates Sync] Impossible de contacter MTGJSON SetList:', err?.message || err)
  }

  // 4. Produits sans date de sortie à mettre à jour
  const productsToUpdate = await prisma.product.findMany({
    where: { releaseDate: null },
    select: { id: true, name: true, category: true, type: true, cardmarketId: true }
  })

  console.log(`[ReleaseDates Sync] Analyse de ${productsToUpdate.length} produits sans date de sortie...`)

  const updatesToRun: { id: number; date: Date }[] = []

  for (const p of productsToUpdate) {
    const pNorm = norm(p.name)
    let matchedDate: Date | null = null

    // A. Table de dates connues directes (kits de démarrage, game night, etc.)
    for (const [knownKey, knownVal] of Object.entries(KNOWN_DATES)) {
      if (pNorm.includes(knownKey) || knownKey.includes(pNorm)) {
        matchedDate = new Date(knownVal)
        break
      }
    }

    // B. Secret Lair Countdown Kit: An Encyclopedia of Magic (novembre 2024)
    if (!matchedDate && (pNorm.includes('encyclopediaofmagic') || pNorm.includes('countdownkitanencyclopedia'))) {
      matchedDate = new Date('2024-11-01')
    }

    // C. Packs Secret Lair 30th Anniversary Countdown Kit (novembre 2022)
    if (!matchedDate && pNorm.includes('30thanniversarycountdownkit')) {
      matchedDate = new Date('2022-11-01')
    }

    // D. 30th Anniversary Edition
    if (!matchedDate && pNorm.includes('30thanniversary')) {
      matchedDate = new Date('2022-11-28')
    }

    // E. Arena League Promos (année dans le nom)
    if (!matchedDate && pNorm.includes('arenaleaguepromos')) {
      const ym = p.name.match(/\b(19\d{2}|20\d{2})\b/)
      if (ym) matchedDate = new Date(`${ym[1]}-01-01`)
    }

    // F. Relic Tokens & Creature Forge
    if (!matchedDate && (pNorm.includes('relictokens') || pNorm.includes('creatureforge'))) {
      if (pNorm.includes('eternal')) matchedDate = new Date('2018-08-01')
      else if (pNorm.includes('overwhelmingswarm')) matchedDate = new Date('2018-07-01')
      else if (pNorm.includes('legendary')) matchedDate = new Date('2018-11-01')
      else if (pNorm.includes('lineage')) matchedDate = new Date('2019-03-01')
      else if (pNorm.includes('relentless')) matchedDate = new Date('2019-07-01')
      else matchedDate = new Date('2018-10-01')
    }

    // G. Oversized Promos
    if (!matchedDate && pNorm.includes('oversized')) {
      matchedDate = new Date('1995-01-01')
    }

    // H. Ixalan Buy-a-Box
    if (!matchedDate && pNorm.includes('ixalan')) {
      matchedDate = new Date('2017-09-29')
    }

    // I. APAC / Euro Lands
    if (!matchedDate && pNorm.includes('apaclands')) {
      matchedDate = new Date('1998-01-01')
    }
    if (!matchedDate && pNorm.includes('eurolands')) {
      matchedDate = new Date('2000-02-01')
    }

    // J. Salvat Decks
    if (!matchedDate && pNorm.includes('salvat')) {
      matchedDate = new Date('2005-08-01')
    }

    // K. Correspondance avec une boîte de boosters existante (par nom complet ou nom de boîte contenu dans le booster/deck)
    if (!matchedDate) {
      for (const box of boxesSorted) {
        if (box.normName.length >= 4 && (pNorm.includes(box.normName) || box.normName.includes(pNorm))) {
          matchedDate = box.date
          break
        }
      }
    }

    // L. Correspondance avec un set Scryfall
    if (!matchedDate) {
      for (const sfSet of scryfallSetsSorted) {
        if (sfSet.normName.length >= 4 && (pNorm.includes(sfSet.normName) || sfSet.normName.includes(pNorm))) {
          matchedDate = sfSet.date
          break
        }
      }
    }

    // M. Correspondance directe par Cardmarket ID depuis MTGJSON
    if (!matchedDate && p.cardmarketId && mcmIdMap.has(p.cardmarketId)) {
      matchedDate = mcmIdMap.get(p.cardmarketId)!
    }

    // N. Correspondance par nom de produit scellé MTGJSON
    if (!matchedDate && sealedNameMap.has(pNorm)) {
      matchedDate = sealedNameMap.get(pNorm)!
    }

    // O. Secret Lair général
    if (!matchedDate && pNorm.includes('secretlair')) {
      matchedDate = new Date('2023-04-14')
    }

    // P. Détection par année pour tout produit restant ayant une année 1990-2029 dans son nom
    if (!matchedDate) {
      const yearMatch = p.name.match(/\b(19\d{2}|20\d{2})\b/)
      if (yearMatch) {
        const yr = yearMatch[1]
        const commanderSet = `commander${yr}`
        if (scryfallMap.has(commanderSet)) {
          matchedDate = scryfallMap.get(commanderSet)!
        } else {
          matchedDate = new Date(`${yr}-06-01`)
        }
      }
    }

    if (matchedDate) {
      updatesToRun.push({ id: p.id, date: matchedDate })
    }
  }

  // Exécution par lots concurrents de 30 pour une vitesse maximale
  const BATCH_SIZE = 30
  let updated = 0
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
    updated += chunk.length
  }

  const remaining = productsToUpdate.length - updated
  console.log(`[ReleaseDates Sync] Fin de synchronisation : ${updated} produits mis à jour avec leur date de sortie. Restants sans date : ${remaining}.`)

  return {
    totalChecked: productsToUpdate.length,
    updated,
    remainingWithoutDate: remaining
  }
}
