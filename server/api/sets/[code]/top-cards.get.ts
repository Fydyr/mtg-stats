import { getScryfallSetsMap } from '../icons.get'
import { extractEditionName } from '../../../utils/sync-ev'
import { prisma } from '../../../utils/prisma'

interface ScryfallCard {
  id: string
  name: string
  rarity: string
  collector_number?: string
  set?: string
  booster?: boolean
  promo?: boolean
  promo_types?: string[]
  frame?: string
  frame_effects?: string[]
  border_color?: string
  finishes?: string[]
  prices: {
    eur?: string | null
    eur_foil?: string | null
    eur_etched?: string | null
    usd?: string | null
    usd_foil?: string | null
    usd_etched?: string | null
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
  treatment?: string | null
  collectorNumber?: string | null
  priceEur: number | null
  priceFoilEur: number | null
  imageUrl: string | null
  cardmarketUrl: string | null
  scryfallUrl: string | null
}

const GENERIC_PREFIXES = new Set([
  'commander',
  'secretlair',
  'secretlairdrop',
  'secretlairdropseries',
  'universesbeyond',
  'dueldecks',
  'fromthevault',
  'challengerdecks',
  'challengerdeck',
  'starterkit'
])

/**
 * Sous-extensions Bonus Sheet présentes dans les boosters Standard (Draft/Play/Set) ET Collector.
 */
const STANDARD_BONUS_SETS: Record<string, string[]> = {
  stx: ['sta'],
  bro: ['brr'],
  mom: ['mul'],
  woe: ['wot'],
  otj: ['otp', 'big'],
  bfz: ['exp'],
  ogw: ['exp'],
  kld: ['mps'],
  aer: ['mps'],
  akh: ['mp2'],
  hou: ['mp2']
}

/**
 * Sous-extensions additionnelles présentes dans les Collector Boosters (ex: Transformers, Jurassic World, Special Guests).
 */
const COLLECTOR_EXTRA_SETS: Record<string, string[]> = {
  stx: ['sta'],
  bro: ['brr', 'bot'],
  mom: ['mul'],
  woe: ['wot'],
  otj: ['otp', 'big'],
  lci: ['rex']
}

/**
 * Traitements exclusifs aux Collector Boosters (jamais présents dans un Draft/Play/Set booster).
 */
const COLLECTOR_ONLY_PROMOS = new Set([
  'serialized',
  'surgefoil',
  'textured',
  'raisedfoil',
  'halofoil',
  'confettifoil',
  'galaxyfoil',
  'fracturefoil',
  'neonink',
  'gilded',
  'manafoil',
  'stepandcompleat',
  'oillick',
  'doubleexposure',
  'invisibleink',
  'poster',
  'headliner'
])

const NON_BOOSTER_PROMOS = new Set([
  'buyabox',
  'prerelease',
  'bundle',
  'datestamped',
  'promopack',
  'starterdeck',
  'commanderparty',
  'storechampionship',
  'bringafriend',
  'giftbox'
])

function normKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

/**
 * Détecte le label de traitement visuel d'une carte (Showcase, Borderless, Extended Art, Surge Foil, etc.).
 */
function detectCardTreatment(card: ScryfallCard): string | null {
  const promos = card.promo_types || []
  const frames = card.frame_effects || []

  if (promos.includes('serialized')) return 'Sérialisée'
  if (promos.includes('fracturefoil')) return 'Fracture Foil'
  if (promos.includes('neonink')) return 'Neon Ink'
  if (promos.includes('textured')) return 'Textured Foil'
  if (promos.includes('raisedfoil')) return 'Raised Foil'
  if (promos.includes('halofoil')) return 'Halo Foil'
  if (promos.includes('confettifoil')) return 'Confetti Foil'
  if (promos.includes('galaxyfoil')) return 'Galaxy Foil'
  if (promos.includes('surgefoil')) return 'Surge Foil'
  if (promos.includes('manafoil')) return 'Mana Foil'
  if (promos.includes('gilded')) return 'Gilded Foil'
  if (promos.includes('stepandcompleat')) return 'Compleat Foil'
  if (promos.includes('poster')) return 'Poster Borderless'
  if (frames.includes('extendedart')) return 'Extended Art'
  if (frames.includes('showcase')) return 'Showcase'
  if (card.border_color === 'borderless') return 'Borderless'
  if (card.frame === '1997' || card.frame === '1993') return 'Retro Frame'
  if (frames.includes('etched') || (card.finishes?.includes('etched') && !card.finishes?.includes('nonfoil'))) {
    return 'Foil Etched'
  }
  return null
}

function isSpecialVariantCard(card: ScryfallCard): boolean {
  return detectCardTreatment(card) !== null
}

function isCollectorOnlyCard(card: ScryfallCard): boolean {
  const promos = card.promo_types || []
  const frames = card.frame_effects || []
  if (frames.includes('extendedart')) return true
  if (promos.some((p) => COLLECTOR_ONLY_PROMOS.has(p))) return true
  if (card.finishes && !card.finishes.includes('nonfoil')) return true
  return false
}

function rarityRank(rarity?: string): number {
  switch ((rarity || '').toLowerCase()) {
    case 'mythic':
      return 4
    case 'rare':
      return 3
    case 'special':
    case 'bonus':
      return 2
    case 'uncommon':
      return 1
    default:
      return 0
  }
}

function mapScryfallCardToChase(card: ScryfallCard, allowUnpriced = false): ChaseCard | null {
  const USD_TO_EUR = 0.90
  const img =
    card.image_uris?.normal ||
    card.image_uris?.small ||
    card.card_faces?.[0]?.image_uris?.normal ||
    null
  if (!img) return null

  const pEur = card.prices?.eur
    ? parseFloat(card.prices.eur)
    : card.prices?.usd
      ? Math.round(parseFloat(card.prices.usd) * USD_TO_EUR * 100) / 100
      : null

  const rawFoil = card.prices?.eur_foil || card.prices?.eur_etched
  const rawUsdFoil = card.prices?.usd_foil || card.prices?.usd_etched
  const pFoil = rawFoil
    ? parseFloat(rawFoil)
    : rawUsdFoil
      ? Math.round(parseFloat(rawUsdFoil) * USD_TO_EUR * 100) / 100
      : null

  if (!allowUnpriced && pEur == null && pFoil == null) return null

  return {
    id: card.id,
    name: card.name,
    rarity: card.rarity,
    treatment: detectCardTreatment(card),
    collectorNumber: card.collector_number || null,
    priceEur: pEur,
    priceFoilEur: pFoil,
    imageUrl: img,
    cardmarketUrl: card.purchase_uris?.cardmarket || null,
    scryfallUrl: card.scryfall_uri || null
  }
}

function sortChaseCards(cards: ChaseCard[]): ChaseCard[] {
  return cards.sort((a, b) => {
    const priceDiff = Math.max(b.priceEur ?? 0, b.priceFoilEur ?? 0) - Math.max(a.priceEur ?? 0, a.priceFoilEur ?? 0)
    if (priceDiff !== 0) return priceDiff
    const rarityDiff = rarityRank(b.rarity) - rarityRank(a.rarity)
    if (rarityDiff !== 0) return rarityDiff
    const cnA = parseInt(String(a.collectorNumber || '9999').replace(/\D/g, ''), 10) || 9999
    const cnB = parseInt(String(b.collectorNumber || '9999').replace(/\D/g, ''), 10) || 9999
    return cnA - cnB
  })
}

/**
 * Récupère les Chase Cards pour une boîte/booster COLLECTOR :
 * Inclut toutes les variantes Collector (Extended Art, Showcase, Borderless, Surge/Textured/Raised/Halo Foil, Sérialisées)
 * avec `&unique=prints` et trie par la valeur maximale (Foil ou Régulière).
 */
async function fetchCollectorChaseCards(code: string): Promise<ChaseCard[]> {
  const extraSets = COLLECTOR_EXTRA_SETS[code] || []
  const allCodes = [code, ...extraSets]
  const setClause = allCodes.length > 1 ? `(${allCodes.map((c) => `e:${c}`).join(' or ')})` : `e:${code}`

  // On lance 2 requêtes parallèles avec unique=prints :
  // 1) Triée par EUR décroissant (couvre les cartes cotées en EUR)
  // 2) Ciblée sur les variantes Collector / Foils triée par USD décroissant (couvre les cartes Foil-only type Surge/Textured/Poster dont eur non-foil est null sur Scryfall)
  const q1 = `${setClause} -is:digital -is:prerelease -is:buyabox -is:bundle -is:promopack`
  const q2 = `${setClause} -is:digital -is:prerelease -is:buyabox -is:bundle (frame:extendedart or frame:showcase or border:borderless or is:foil)`

  const [res1, res2] = await Promise.all([
    fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(q1)}&unique=prints&order=eur&dir=desc`, {
      headers: { 'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)', Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    }).catch(() => null),
    fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(q2)}&unique=prints&order=usd&dir=desc`, {
      headers: { 'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)', Accept: 'application/json' },
      signal: AbortSignal.timeout(10000)
    }).catch(() => null)
  ])

  const combinedRaw: ScryfallCard[] = []
  const seenIds = new Set<string>()

  for (const r of [res1, res2]) {
    if (r && r.ok) {
      const json = (await r.json().catch(() => ({}))) as { data?: ScryfallCard[] }
      for (const c of json.data || []) {
        if (!seenIds.has(c.id)) {
          seenIds.add(c.id)
          combinedRaw.push(c)
        }
      }
    }
  }

  // Filtrer les promos hors-boosters (Prerelease, Buy-a-Box, Bundle)
  const eligible = combinedRaw.filter((c) => {
    const promos = c.promo_types || []
    return !promos.some((p) => NON_BOOSTER_PROMOS.has(p))
  })

  // Pour chaque nom de carte, on privilégie la version Collector la plus chère (ou avec traitement spécial)
  // afin d'afficher les vraies cartes "Chase" de la boîte Collector sans répéter 3 fois le même nom de carte
  const bestByCardName = new Map<string, { card: ScryfallCard; mapped: ChaseCard; score: number }>()

  for (const raw of eligible) {
    const mapped = mapScryfallCardToChase(raw)
    if (!mapped) continue

    const maxPrice = Math.max(mapped.priceFoilEur ?? 0, mapped.priceEur ?? 0)
    if (maxPrice <= 0) continue

    // Bonus de tri léger pour privilégier le visuel Variant / Collector (Borderless, Extended Art, Showcase, Surge Foil)
    // lorsque la version Collector et la version standard ont des prix proches
    const isVariant = isSpecialVariantCard(raw)
    const score = isVariant ? maxPrice * 1.15 : maxPrice

    const nameKey = raw.name.toLowerCase().trim()
    const prev = bestByCardName.get(nameKey)
    if (!prev || score > prev.score) {
      bestByCardName.set(nameKey, { card: raw, mapped, score })
    }
  }

  const sorted = Array.from(bestByCardName.values())
    .sort((a, b) => {
      const pA = Math.max(a.mapped.priceFoilEur ?? 0, a.mapped.priceEur ?? 0)
      const pB = Math.max(b.mapped.priceFoilEur ?? 0, b.mapped.priceEur ?? 0)
      return pB - pA
    })
    .map((x) => x.mapped)

  if (sorted.length > 0) {
    return sorted.slice(0, 8)
  }

  // Fallback pour les extensions en précommande dont les cartes n'ont pas encore de prix Scryfall
  const unpricedByName = new Map<string, ChaseCard>()
  for (const raw of eligible) {
    const mapped = mapScryfallCardToChase(raw, true)
    if (!mapped) continue
    const k = raw.name.toLowerCase().trim()
    if (!unpricedByName.has(k) || isSpecialVariantCard(raw)) {
      unpricedByName.set(k, mapped)
    }
  }
  return sortChaseCards(Array.from(unpricedByName.values())).slice(0, 8)
}

/**
 * Récupère les Chase Cards pour une boîte/booster STANDARD (Draft, Play, Set, Bundle) :
 * Exclut strictement les variantes réservées aux Collector Boosters (Extended Art, Surge Foil, Textured, Sérialisées, etc.)
 * et retient les versions régulières ouvrables en boosters standard (`is:booster`).
 */
async function fetchStandardBoosterChaseCards(code: string): Promise<ChaseCard[]> {
  const bonusSets = STANDARD_BONUS_SETS[code] || []
  const allCodes = [code, ...bonusSets]
  const setClause = allCodes.length > 1 ? `(${allCodes.map((c) => `e:${c}`).join(' or ')})` : `e:${code}`

  // 1. Essai prioritaire avec le filtre officiel `is:booster` de Scryfall
  const boosterQuery = `${setClause} is:booster -is:digital -frame:extendedart`
  let rawCards: ScryfallCard[] = []

  try {
    const res = await fetch(
      `https://api.scryfall.com/cards/search?q=${encodeURIComponent(boosterQuery)}&unique=prints&order=eur&dir=desc`,
      {
        headers: { 'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)', Accept: 'application/json' },
        signal: AbortSignal.timeout(10000)
      }
    )
    if (res.ok) {
      const json = (await res.json()) as { data?: ScryfallCard[] }
      rawCards = json.data || []
    }
  } catch {
    // ignore
  }

  // 2. Fallback si l'extension est très récente et n'a pas encore le tag `is:booster` sur Scryfall
  if (rawCards.length === 0) {
    try {
      const fallbackQuery = `${setClause} -is:digital -is:promo -frame:extendedart`
      const res = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(fallbackQuery)}&unique=prints&order=eur&dir=desc`,
        {
          headers: { 'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)', Accept: 'application/json' },
          signal: AbortSignal.timeout(10000)
        }
      )
      if (res.ok) {
        const json = (await res.json()) as { data?: ScryfallCard[] }
        rawCards = json.data || []
      }
    } catch {
      // ignore
    }
  }

  // Filtrer toutes les cartes Collector-only (Extended Art, Surge Foil, Textured, Serialized, Foil-only...)
  // et dédupliquer par nom de carte en privilégiant l'impression standard du set principal
  const byName = new Map<string, { mapped: ChaseCard; isStandardFrame: boolean; cn: number }>()

  for (const raw of rawCards) {
    const promos = raw.promo_types || []
    if (promos.some((p) => NON_BOOSTER_PROMOS.has(p))) continue
    if (isCollectorOnlyCard(raw)) continue

    const mapped = mapScryfallCardToChase(raw)
    if (!mapped) continue
    if (mapped.priceEur == null && mapped.priceFoilEur == null) continue

    const isStandardFrame = !isSpecialVariantCard(raw)
    const cn = parseInt(String(raw.collector_number || '9999').replace(/\D/g, ''), 10) || 9999
    const key = raw.name.toLowerCase().trim()

    const prev = byName.get(key)
    if (!prev) {
      byName.set(key, { mapped, isStandardFrame, cn })
    } else {
      // Pour une boîte standard (Draft/Play/Set), préférer l'illustration régulière (numéro de collection le plus bas)
      if (
        (isStandardFrame && !prev.isStandardFrame) ||
        (isStandardFrame === prev.isStandardFrame && cn < prev.cn)
      ) {
        byName.set(key, { mapped, isStandardFrame, cn })
      }
    }
  }

  const cards = Array.from(byName.values()).map((x) => x.mapped)
  cards.sort((a, b) => {
    const valA = a.priceEur ?? a.priceFoilEur ?? 0
    const valB = b.priceEur ?? b.priceFoilEur ?? 0
    return valB - valA
  })

  if (cards.length > 0) {
    return cards.slice(0, 8)
  }

  // Fallback pour les extensions en précommande dont les cartes n'ont pas encore de prix Scryfall
  const unpricedByName = new Map<string, ChaseCard>()
  for (const raw of rawCards) {
    const promos = raw.promo_types || []
    if (promos.some((p) => NON_BOOSTER_PROMOS.has(p))) continue
    if (isCollectorOnlyCard(raw)) continue
    const mapped = mapScryfallCardToChase(raw, true)
    if (!mapped) continue
    const k = raw.name.toLowerCase().trim()
    if (!unpricedByName.has(k)) {
      unpricedByName.set(k, mapped)
    }
  }
  return sortChaseCards(Array.from(unpricedByName.values())).slice(0, 8)
}

async function resolveCodeFromProductName(productName: string): Promise<string | null> {
  if (!productName) return null
  const map = await getScryfallSetsMap()

  const rawKey = normKey(productName)
  if (map[rawKey]) return map[rawKey].code.toLowerCase()

  const cleanKey = normKey(extractEditionName(productName))
  if (cleanKey && !GENERIC_PREFIXES.has(cleanKey) && map[cleanKey]) return map[cleanKey].code.toLowerCase()

  if (/\bsecret\s+lair\b/i.test(productName)) {
    if (/\b30th\s+anniversary\b/i.test(productName)) return 'slc'
    if (/\bultimate\s+edition\b/i.test(productName)) return 'slu'
    return 'sld'
  }

  if (productName.includes(':')) {
    const parts = productName.split(':').map((s) => normKey(extractEditionName(s)))
    for (const partKey of parts) {
      if (partKey.length >= 4 && !GENERIC_PREFIXES.has(partKey) && map[partKey]) {
        return map[partKey].code.toLowerCase()
      }
    }
  }

  const target = cleanKey || rawKey
  const sorted = Object.entries(map)
    .filter(([k]) => k.length >= 5 && !GENERIC_PREFIXES.has(k))
    .sort((a, b) => b[0].length - a[0].length)

  for (const [k, v] of sorted) {
    if (target.includes(k) || k.includes(target)) {
      return v.code.toLowerCase()
    }
  }
  return null
}

const cache = new Map<
  string,
  {
    timestamp: number
    setCode: string
    productMode: 'COLLECTOR' | 'STANDARD' | 'SECRET_LAIR'
    isSecretLair?: boolean
    dropName?: string | null
    cards: ChaseCard[]
  }
>()
const CACHE_TTL_MS = 1000 * 60 * 60 * 12 // 12 heures

export default defineEventHandler(
  async (
    event
  ): Promise<{
    ok: boolean
    setCode: string
    productMode?: 'COLLECTOR' | 'STANDARD' | 'SECRET_LAIR'
    isSecretLair?: boolean
    dropName?: string | null
    cards: ChaseCard[]
  }> => {
    let code = (getRouterParam(event, 'code') || '').toLowerCase().trim()
    const query = getQuery(event)
    let productName = typeof query.name === 'string' ? query.name.trim() : ''
    let productType = typeof query.type === 'string' ? query.type.toUpperCase().trim() : ''
    const productId = query.productId ? Number(query.productId) : null

    let dbProduct: {
      id: number
      name: string
      type: string
      category: string
      cardmarketId: number | null
      releaseDate: Date | null
    } | null = null

    if (productId && Number.isInteger(productId) && productId > 0) {
      dbProduct = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, type: true, category: true, cardmarketId: true, releaseDate: true }
      })
      if (dbProduct) {
        if (!productName) productName = dbProduct.name
        if (!productType) productType = dbProduct.type
      }
    }

    const isSecretLairProduct =
      /\bsecret\s+lair\b/i.test(productName) || code === 'sld' || code === 'slc' || code === 'slu'

    // Aucun affichage de Chase Cards pour les produits Secret Lair
    if (isSecretLairProduct) {
      return {
        ok: true,
        setCode: '',
        isSecretLair: true,
        cards: []
      }
    }

    const isCollectorProduct =
      productType === 'COLLECTOR' || /\bcollector\b/i.test(productName)
    const productMode: 'COLLECTOR' | 'STANDARD' = isCollectorProduct ? 'COLLECTOR' : 'STANDARD'

    if ((!code || code === 'lookup' || code === 'null' || code === 'undefined') && productName) {
      const resolved = await resolveCodeFromProductName(productName)
      if (resolved) code = resolved
    }

    const cacheKey = `${productMode}_${code || normKey(productName)}`

    const now = Date.now()
    const cached = cache.get(cacheKey)
    if (cached && cached.cards.length > 0 && now - cached.timestamp < CACHE_TTL_MS) {
      return {
        ok: true,
        setCode: cached.setCode,
        productMode: cached.productMode,
        isSecretLair: cached.isSecretLair,
        dropName: cached.dropName,
        cards: cached.cards
      }
    }

    if (!code || code === 'lookup' || !/^[a-z0-9]{2,6}$/i.test(code)) {
      return { ok: false, setCode: '', cards: [] }
    }

    try {
      // 2. Boîte / Booster COLLECTOR vs Boîte / Booster STANDARD (Draft, Play, Set, Bundle)
      const topCards =
        productMode === 'COLLECTOR'
          ? await fetchCollectorChaseCards(code)
          : await fetchStandardBoosterChaseCards(code)

      if (topCards.length > 0) {
        cache.set(cacheKey, {
          timestamp: now,
          setCode: code.toUpperCase(),
          productMode,
          isSecretLair: false,
          dropName: null,
          cards: topCards
        })
      }

      return {
        ok: true,
        setCode: code.toUpperCase(),
        productMode,
        isSecretLair: false,
        dropName: null,
        cards: topCards
      }
    } catch (err: any) {
      console.warn(`[Scryfall Chase Cards] Impossible de charger les cartes (${productMode}) pour set:${code}:`, err?.message || err)
      return { ok: false, setCode: code.toUpperCase(), productMode, cards: [] }
    }
  }
)
