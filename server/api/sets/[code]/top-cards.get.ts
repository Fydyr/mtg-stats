interface ScryfallCard {
  id: string
  name: string
  rarity: string
  prices: {
    eur?: string | null
    eur_foil?: string | null
    usd?: string | null
  }
  image_uris?: {
    small?: string
    normal?: string
    large?: string
    art_crop?: string
  }
  card_faces?: Array<{
    name: string
    image_uris?: {
      small?: string
      normal?: string
      large?: string
    }
  }>
  purchase_uris?: {
    cardmarket?: string
  }
  scryfall_uri?: string
}

export interface ChaseCard {
  id: string
  name: string
  rarity: string
  priceEur: number | null
  priceFoilEur: number | null
  imageUrl: string | null
  cardmarketUrl: string | null
  scryfallUrl: string | null
}

const cache = new Map<string, { timestamp: number; cards: ChaseCard[] }>()
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 // 24 heures

export default defineEventHandler(async (event): Promise<{ ok: boolean; setCode: string; cards: ChaseCard[] }> => {
  const code = (getRouterParam(event, 'code') || '').toLowerCase().trim()
  if (!code || !/^[a-z0-9]{2,6}$/i.test(code)) {
    throw createError({ statusCode: 400, statusMessage: 'Code d’extension invalide' })
  }

  const now = Date.now()
  const cached = cache.get(code)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return { ok: true, setCode: code.toUpperCase(), cards: cached.cards }
  }

  try {
    const url = `https://api.scryfall.com/cards/search?q=set:${encodeURIComponent(code)}+not:digital&order=eur&dir=desc`
    const res = await $fetch<{ data: ScryfallCard[] }>(url, {
      headers: {
        'User-Agent': 'MTG-Stats/1.0 (https://mtg-stats.aeroliths.fr)'
      },
      timeout: 8000
    })

    const rawList = res.data || []
    const cards: ChaseCard[] = []

    for (const card of rawList) {
      if (cards.length >= 8) break

      const img = card.image_uris?.normal || card.image_uris?.small || card.card_faces?.[0]?.image_uris?.normal || null
      if (!img) continue

      const pEur = card.prices?.eur ? parseFloat(card.prices.eur) : null
      const pFoil = card.prices?.eur_foil ? parseFloat(card.prices.eur_foil) : null

      // Ignorer les cartes sans aucun prix connu
      if (pEur == null && pFoil == null) continue

      cards.push({
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        priceEur: pEur,
        priceFoilEur: pFoil,
        imageUrl: img,
        cardmarketUrl: card.purchase_uris?.cardmarket || null,
        scryfallUrl: card.scryfall_uri || null
      })
    }

    cache.set(code, { timestamp: now, cards })
    return { ok: true, setCode: code.toUpperCase(), cards }
  } catch (err: any) {
    console.warn(`[Scryfall Chase Cards] Impossible de charger les cartes pour set:${code}:`, err?.message || err)
    return { ok: false, setCode: code.toUpperCase(), cards: [] }
  }
})
