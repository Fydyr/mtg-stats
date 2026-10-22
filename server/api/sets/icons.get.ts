interface ScryfallSet {
  code: string
  name: string
  icon_svg_uri: string
  released_at?: string
  set_type?: string
}

function norm(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

let cachedIcons: Record<string, { code: string; icon: string }> | null = null
let lastFetched = 0
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24h

export default defineEventHandler(async () => {
  const now = Date.now()
  if (cachedIcons && now - lastFetched < CACHE_TTL_MS) {
    return cachedIcons
  }

  try {
    const res = await $fetch<{ data: ScryfallSet[] }>('https://api.scryfall.com/sets', {
      headers: {
        'User-Agent': 'MTG-Stats/1.0 (https://mtg-stats.aeroliths.fr)'
      },
      timeout: 8000
    })

    const map: Record<string, { code: string; icon: string }> = {}

    for (const set of res.data || []) {
      if (set.name && set.icon_svg_uri) {
        const item = { code: set.code.toUpperCase(), icon: set.icon_svg_uri }
        map[norm(set.name)] = item
        map[norm(set.code)] = item
      }
    }

    cachedIcons = map
    lastFetched = now
    return map
  } catch (err: any) {
    console.warn('[Scryfall Icons] Impossible de récupérer les sets Scryfall:', err?.message || err)
    return cachedIcons || {}
  }
})
