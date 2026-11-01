interface ScryfallSet {
  code: string
  name: string
  icon_svg_uri: string
  released_at?: string
  set_type?: string
  digital?: boolean
}

function norm(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

const IGNORED_SET_TYPES = new Set([
  'token',
  'memorabilia',
  'promo',
  'alchemy',
  'minigame',
  'vanguard',
  'treasure_chest'
])

const MAIN_SET_TYPES = new Set([
  'expansion',
  'core',
  'masters',
  'draft_innovation',
  'commander',
  'starter',
  'funny'
])

let cachedIcons: Record<string, { code: string; icon: string }> | null = null
let lastFetched = 0
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h

export async function getScryfallSetsMap(): Promise<Record<string, { code: string; icon: string }>> {
  const now = Date.now()
  if (cachedIcons && Object.keys(cachedIcons).length > 0 && now - lastFetched < CACHE_TTL_MS) {
    return cachedIcons
  }

  try {
    const rawRes = await fetch('https://api.scryfall.com/sets', {
      headers: {
        'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)',
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(10000)
    })
    if (!rawRes.ok) {
      return cachedIcons || {}
    }
    const res = (await rawRes.json()) as { data?: ScryfallSet[] }

    const map: Record<string, { code: string; icon: string }> = {}
    const sets = res.data || []

    // 1er passage : extensions secondaires (hors tokens/promos/art series)
    for (const set of sets) {
      if (!set.name || !set.code || !set.icon_svg_uri || set.digital) continue
      if (IGNORED_SET_TYPES.has(set.set_type || '')) continue
      if (MAIN_SET_TYPES.has(set.set_type || '')) continue

      const item = { code: set.code.toUpperCase(), icon: set.icon_svg_uri }
      map[norm(set.name)] = item
      map[norm(set.code)] = item
    }

    // 2nd passage (prioritaire) : extensions principales (expansion, core, masters, draft_innovation, commander)
    // Écrase toute collision éventuelle avec un sous-set
    for (const set of sets) {
      if (!set.name || !set.code || !set.icon_svg_uri || set.digital) continue
      if (!MAIN_SET_TYPES.has(set.set_type || '')) continue

      const item = { code: set.code.toUpperCase(), icon: set.icon_svg_uri }
      map[norm(set.name)] = item
      map[norm(set.code)] = item
    }

    cachedIcons = map
    lastFetched = now
    return map
  } catch (err: any) {
    console.warn('[Scryfall Icons] Impossible de récupérer les sets Scryfall:', err?.message || err)
    return cachedIcons || {}
  }
}

export default defineEventHandler(async () => {
  return await getScryfallSetsMap()
})
