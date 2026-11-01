import { extractEditionName } from './sync-ev'

export interface StandardSetInfo {
  code: string
  name: string
  normName: string
  releasedAt: Date
  legalUntil: Date
}

interface StandardCache {
  fetchedAt: number
  cutoffDate: Date
  setsByNormName: Map<string, StandardSetInfo>
  setsSorted: StandardSetInfo[]
}

const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 heures
let cache: StandardCache | null = null

// Produits et séries qui ne sont jamais des boîtes/boosters Standard (Commander, Jumpstart, Masters, Horizons, Remastered, Secret Lair, UB Modern 2023-2024, etc.)
export const NON_STANDARD_PRODUCT_REGEX =
  /\b(?:mystery|cluedo|clue\s+edition|masters|horizons|remastered|commander|jumpstart|secret\s+lair|unfinity|unsanctioned|unstable|unhinged|unglued|fallout|warhammer|doctor\s+who|assassin|lord\s+of\s+the\s+rings|tales\s+of\s+middle|jurassic|transformers|aftermath|modern\s+event|conspiracy|battlebond|planechase|archenemy|game\s+night|explorers\s+of\s+ixalan|anthology|from\s+the\s+vault|spellbook|starter|challenger|theme\s+booster|theme\s+deck|value\s+booster|collector'?s\s+edition|world\s+championship|chronicles|renaissance|time\s+spiral|big\s+score|breaking\s+news|special\s+guests|multiverse\s+legends)\b/i

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^magic:\s*the\s*gathering\s*[-–—|:]?\s*/i, '')
    .replace(/^universes\s*beyond:\s*/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

/**
 * Calcule dynamiquement la date de début du Standard actuel selon le calendrier officiel WotC :
 * - Jusqu'à début 2027 : toutes les extensions depuis Wilds of Eldraine (septembre 2023) sont légales.
 * - À partir de 2027 (rotation par année civile) : les extensions des 2 années civiles précédentes + l'année en cours (ex: en 2027 -> depuis janv. 2025),
 *   ainsi que Foundations (légale jusqu'en fin 2029 minimum).
 */
export function getDynamicStandardCutoffDate(now = new Date()): Date {
  const year = now.getFullYear()
  const month = now.getMonth() // 0-indexed (0 = janvier)
  // Rotation début 2027 (février 2027)
  if (year < 2027 || (year === 2027 && month === 0)) {
    return new Date('2023-09-01')
  }
  return new Date(`${year - 2}-01-01`)
}

/**
 * Calcule automatiquement la date de fin de légalité Standard d'une extension selon sa date de sortie et son nom.
 */
export function computeStandardLegalUntil(setName: string, releasedAt: Date): Date {
  if (/\b(?:foundations|fondations)\b/i.test(setName)) {
    return new Date('2029-12-31')
  }
  const relYear = releasedAt.getFullYear()
  if (relYear <= 2024) {
    // Wilds of Eldraine (sept. 2023) -> Duskmourn (sept. 2024) quittent le Standard ensemble début 2027
    return new Date('2027-02-01')
  }
  // À partir de 2025, rotation par année civile au début de l'année Y + 3 (ex: sorties 2025 -> début 2028, sorties 2026 -> début 2029)
  return new Date(`${relYear + 3}-02-01`)
}

// Liste de secours initiale (si Scryfall et What's in Standard sont temporairement hors-ligne)
const FALLBACK_STANDARD_SETS: { code: string; name: string; frName?: string; releasedAt: string }[] = [
  { code: 'woe', name: 'Wilds of Eldraine', frName: "Les Friches d'Eldraine", releasedAt: '2023-09-08' },
  { code: 'lci', name: 'The Lost Caverns of Ixalan', frName: "Les cavernes oubliées d'Ixalan", releasedAt: '2023-11-17' },
  { code: 'mkm', name: 'Murders at Karlov Manor', frName: 'Meurtres au manoir Karlov', releasedAt: '2024-02-09' },
  { code: 'otj', name: 'Outlaws of Thunder Junction', frName: 'Les hors-la-loi de Croisetonnerre', releasedAt: '2024-04-19' },
  { code: 'blb', name: 'Bloomburrow', releasedAt: '2024-08-02' },
  { code: 'dsk', name: 'Duskmourn: House of Horror', frName: "Mornebrune : la Maison de l'horreur", releasedAt: '2024-09-27' },
  { code: 'fdn', name: 'Magic: The Gathering Foundations', frName: 'Fondations de Magic: The Gathering', releasedAt: '2024-11-15' },
  { code: 'dft', name: 'Aetherdrift', releasedAt: '2025-02-14' },
  { code: 'tdm', name: 'Tarkir: Dragonstorm', frName: 'Tarkir : la tempête des dragons', releasedAt: '2025-04-11' },
  { code: 'fin', name: 'Final Fantasy', releasedAt: '2025-06-13' },
  { code: 'eoe', name: 'Edge of Eternities', frName: 'Aux portes des Éternités', releasedAt: '2025-08-01' },
  { code: 'spm', name: "Marvel's Spider-Man", releasedAt: '2025-09-26' },
  { code: 'tla', name: 'Avatar: The Last Airbender', frName: "Avatar, le dernier maître de l'air", releasedAt: '2025-11-21' },
  { code: 'ecl', name: 'Lorwyn Eclipsed', frName: 'Lorwyn éclipsé', releasedAt: '2026-01-23' },
  { code: 'tmt', name: 'Teenage Mutant Ninja Turtles', releasedAt: '2026-03-01' },
  { code: 'sos', name: 'Secrets of Strixhaven', frName: 'Les secrets de Strixhaven', releasedAt: '2026-04-24' },
  { code: 'msh', name: 'Marvel Super Heroes', releasedAt: '2026-06-26' },
  { code: 'hob', name: 'The Hobbit', frName: 'Le Hobbit', releasedAt: '2026-08-21' },
  { code: 'rfr', name: 'Reality Fracture', frName: 'Réalité fracturée', releasedAt: '2026-10-16' }
]

function registerSetAliases(
  map: Map<string, StandardSetInfo>,
  info: StandardSetInfo,
  extraAliases: string[] = []
) {
  const candidates = new Set<string>([
    info.normName,
    norm(info.name),
    ...extraAliases.map((a) => norm(a))
  ])

  // Si le nom contient ":" ou "|", on indexe aussi la partie principale (ex: "Duskmourn: House of Horror" -> "duskmourn", "Tarkir: Dragonstorm" -> "dragonstorm")
  if (info.name.includes(':') || info.name.includes('|')) {
    const parts = info.name.split(/[:|]/).map((s) => s.trim())
    for (const part of parts) {
      const n = norm(part)
      // Évite d'indexer un préfixe générique ou un nom d'ancien bloc seul ("tarkir", "ixalan", "strixhaven", "lorwyn")
      if (
        n.length >= 6 &&
        !['magicthegathering', 'universesbeyond', 'tarkir', 'ixalan', 'strixhaven', 'lorwyn', 'eldraine', 'ravnica', 'innistrad', 'dominaria', 'zendikar', 'kamigawa'].includes(n)
      ) {
        candidates.add(n)
      }
    }
  }

  for (const key of candidates) {
    if (key.length >= 4) {
      map.set(key, info)
    }
  }
}

/**
 * Récupère et met en cache dynamiquement toutes les extensions légales en Standard
 * via les APIs officielles Scryfall (/sets) et What's in Standard, sans maintenance manuelle.
 */
export async function getDynamicStandardCache(): Promise<StandardCache> {
  const now = new Date()
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache
  }

  const cutoffDate = getDynamicStandardCutoffDate(now)
  const setsByNormName = new Map<string, StandardSetInfo>()

  // 1. Chargement de la base de référence (noms EN + FR) filtrée dynamiquement selon la date de rotation actuelle
  for (const fb of FALLBACK_STANDARD_SETS) {
    const rel = new Date(fb.releasedAt)
    const legalUntil = computeStandardLegalUntil(fb.name, rel)
    if (legalUntil < now) continue
    if (rel < cutoffDate && fb.code !== 'fdn') continue

    const info: StandardSetInfo = {
      code: fb.code,
      name: fb.name,
      normName: norm(fb.name),
      releasedAt: rel,
      legalUntil
    }
    registerSetAliases(setsByNormName, info, fb.frName ? [fb.frName] : [])
  }

  // 2. Synchronisation dynamique depuis Scryfall (/sets) :
  // Toute nouvelle extension "expansion" ou "core" papier sortie après cutoffDate est automatiquement ajoutée !
  try {
    const sfRes = await fetch('https://api.scryfall.com/sets', {
      headers: { 'User-Agent': 'MTG-Stats/1.0 (https://mtg-stats.aeroliths.fr)' }
    })
    if (sfRes.ok) {
      const sfJson = (await sfRes.json()) as { data?: any[] }
      for (const s of sfJson.data || []) {
        if (!s.name || !s.released_at) continue
        if (s.digital === true) continue
        // En Standard, seuls les sets de type 'expansion' ou 'core' sont des extensions principales
        if (s.set_type !== 'expansion' && s.set_type !== 'core') continue
        if (NON_STANDARD_PRODUCT_REGEX.test(s.name)) continue

        const rel = new Date(s.released_at)
        if (isNaN(rel.getTime())) continue

        const isFoundations = /\bfoundations\b/i.test(s.name) || s.code === 'fdn'
        if (!isFoundations && rel < cutoffDate) continue

        const legalUntil = computeStandardLegalUntil(s.name, rel)
        if (legalUntil < now) continue

        const info: StandardSetInfo = {
          code: String(s.code || '').toLowerCase(),
          name: s.name,
          normName: norm(s.name),
          releasedAt: rel,
          legalUntil
        }
        registerSetAliases(setsByNormName, info)
      }
    }
  } catch (err: any) {
    console.warn('[StandardLegal] Scryfall indisponible, utilisation du cache dynamique :', err?.message || err)
  }

  // 3. Enrichissement avec What's in Standard API (si disponible) pour récupérer d'éventuelles dates exactes de fin de légalité
  try {
    const wisRes = await fetch('https://whatsinstandard.com/api/v6/standard.json', {
      headers: { 'User-Agent': 'MTG-Stats/1.0 (https://mtg-stats.aeroliths.fr)' }
    })
    if (wisRes.ok) {
      const wisJson = (await wisRes.json()) as { sets?: any[] }
      for (const ws of wisJson.sets || []) {
        if (!ws.name || !ws.enterDate?.exact) continue
        if (NON_STANDARD_PRODUCT_REGEX.test(ws.name)) continue

        const enter = new Date(ws.enterDate.exact)
        if (isNaN(enter.getTime())) continue
        const isFoundations = /\bfoundations\b/i.test(ws.name) || String(ws.code || '').toLowerCase() === 'fdn'
        if (!isFoundations && enter < cutoffDate) continue

        let legalUntil = computeStandardLegalUntil(ws.name, enter)
        if (ws.exitDate?.exact) {
          const exactExit = new Date(ws.exitDate.exact)
          if (!isNaN(exactExit.getTime())) {
            legalUntil = exactExit
          }
        }
        if (legalUntil < now) continue

        const info: StandardSetInfo = {
          code: String(ws.code || '').toLowerCase(),
          name: ws.name,
          normName: norm(ws.name),
          releasedAt: enter,
          legalUntil
        }
        registerSetAliases(setsByNormName, info)
      }
    }
  } catch {
    // Silencieux : Scryfall + règles WotC suffisent
  }

  const uniqueSets = new Map<string, StandardSetInfo>()
  for (const [alias, info] of setsByNormName.entries()) {
    uniqueSets.set(alias, info)
  }
  const setsSorted = Array.from(uniqueSets.entries())
    .map(([alias, info]) => ({ ...info, normName: alias }))
    .sort((a, b) => b.normName.length - a.normName.length)

  cache = {
    fetchedAt: Date.now(),
    cutoffDate,
    setsByNormName,
    setsSorted
  }
  return cache
}

/**
 * Détermine automatiquement la date de fin de légalité Standard d'un produit (ou null s'il n'est pas légal en Standard).
 */
export function resolveProductStandardLegalUntil(
  product: {
    name: string
    releaseDate?: Date | string | null
    standardLegalUntil?: Date | string | null
  },
  stdCache: StandardCache,
  now = new Date()
): Date | null {
  if (!product.name) return null
  if (NON_STANDARD_PRODUCT_REGEX.test(product.name)) return null

  // 1. Si configuré manuellement dans l'admin et toujours dans le futur
  if (product.standardLegalUntil) {
    const manualDate = new Date(product.standardLegalUntil)
    if (!isNaN(manualDate.getTime())) {
      return manualDate >= now ? manualDate : null
    }
  }

  // 2. Vérification de la date de sortie (empêche les homonymes d'anciennes extensions comme Time Spiral 2006 ou Lorwyn 2007)
  const relDate = product.releaseDate ? new Date(product.releaseDate) : null
  const isFoundations = /\b(?:foundations|fondations)\b/i.test(product.name)
  if (!relDate || isNaN(relDate.getTime())) return null
  if (!isFoundations && relDate < stdCache.cutoffDate) return null

  // 3. Correspondance exacte sur le nom d'édition nettoyé
  const cleanEdition = extractEditionName(product.name)
  const editionNorm = norm(cleanEdition)
  const fullNorm = norm(product.name)

  if (stdCache.setsByNormName.has(editionNorm)) {
    return stdCache.setsByNormName.get(editionNorm)!.legalUntil
  }
  if (stdCache.setsByNormName.has(fullNorm)) {
    return stdCache.setsByNormName.get(fullNorm)!.legalUntil
  }

  // 4. Correspondance par inclusion (du nom d'extension le plus long au plus court)
  for (const s of stdCache.setsSorted) {
    if (s.normName.length >= 5 && (editionNorm.includes(s.normName) || fullNorm.includes(s.normName))) {
      return s.legalUntil
    }
  }

  return null
}

