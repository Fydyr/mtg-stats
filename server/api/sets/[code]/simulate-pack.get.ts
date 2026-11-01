import { getScryfallSetsMap } from '../icons.get'
import { extractEditionName } from '../../../utils/sync-ev'
import { prisma } from '../../../utils/prisma'

interface ScryfallCard {
  id: string
  name: string
  rarity: string
  type_line?: string
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
  }
  card_faces?: Array<{
    name: string
    type_line?: string
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

export interface SimulatedPackCard {
  uid: string
  id: string
  name: string
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special'
  slotLabel: string
  isLand: boolean
  isFoil: boolean
  treatment: string | null
  collectorNumber: string | null
  effectivePriceEur: number
  priceEur: number | null
  priceFoilEur: number | null
  imageUrl: string | null
  scryfallUrl: string | null
}

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
  'scroll',
  'ripplefoil',
  'silverfoil'
])

const DOUBLE_MASTERS_SETS = new Set(['2xm', '2x2'])
const GUARANTEED_FOIL_DRAFT_SETS = new Set([
  'mma',
  'mm2',
  'mm3',
  'ema',
  'ima',
  'uma',
  'a25',
  'mh1',
  'mh2',
  'mh3',
  'dmr',
  'rvr',
  'inr',
  'cmm',
  'cmr',
  'clb',
  'tsr'
])

const setPoolCache = new Map<string, { timestamp: number; cards: ScryfallCard[] }>()
const CACHE_TTL = 1000 * 60 * 30 // 30 minutes

const usdToEur = (v: string | null | undefined): number | null => {
  if (!v) return null
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n * 0.92 * 100) / 100 : null
}

function getCardImageUrl(c: ScryfallCard): string | null {
  return (
    c.image_uris?.normal ||
    c.image_uris?.large ||
    c.card_faces?.[0]?.image_uris?.normal ||
    c.card_faces?.[0]?.image_uris?.large ||
    null
  )
}

function getCardTypeLine(c: ScryfallCard): string {
  return c.type_line || c.card_faces?.[0]?.type_line || ''
}

function isLandCard(c: ScryfallCard): boolean {
  const tl = getCardTypeLine(c)
  // Exclut les cartes recto-verso dont seul le verso est un terrain (MDFC sorts)
  const frontTl = c.card_faces?.[0]?.type_line || c.type_line || ''
  return /\bLand\b/i.test(frontTl) || /\bBasic\s+Land\b/i.test(tl)
}

function isBasicLandCard(c: ScryfallCard): boolean {
  const tl = getCardTypeLine(c)
  return /\bBasic\b/i.test(tl) && /\bLand\b/i.test(tl)
}

function isCollectorOnlyCard(c: ScryfallCard): boolean {
  const promos = (c.promo_types || []).map((p) => p.toLowerCase())
  const frames = (c.frame_effects || []).map((f) => f.toLowerCase())
  const finishes = (c.finishes || []).map((f) => f.toLowerCase())
  if (frames.includes('extendedart')) return true
  if (promos.some((p) => COLLECTOR_ONLY_PROMOS.has(p))) return true
  if (finishes.length === 1 && finishes[0] === 'etched') return true
  return false
}

function isSpecialTreatmentCard(c: ScryfallCard): boolean {
  const frames = (c.frame_effects || []).map((f) => f.toLowerCase())
  const promos = (c.promo_types || []).map((p) => p.toLowerCase())
  return (
    c.border_color === 'borderless' ||
    c.frame === '1997' ||
    c.frame === '1993' ||
    frames.includes('showcase') ||
    frames.includes('extendedart') ||
    frames.includes('inverted') ||
    frames.includes('etched') ||
    promos.includes('boosterfun')
  )
}

function extractTreatmentLabel(c: ScryfallCard): string | null {
  const promos = (c.promo_types || []).map((p) => p.toLowerCase())
  const frames = (c.frame_effects || []).map((f) => f.toLowerCase())
  if (promos.includes('serialized')) return 'Serialized'
  if (promos.includes('textured')) return 'Textured Foil'
  if (promos.includes('surgefoil')) return 'Surge Foil'
  if (promos.includes('halofoil')) return 'Halo Foil'
  if (promos.includes('raisedfoil')) return 'Raised Foil'
  if (promos.includes('confettifoil')) return 'Confetti Foil'
  if (promos.includes('galaxyfoil')) return 'Galaxy Foil'
  if (promos.includes('fracturefoil')) return 'Fracture Foil'
  if (promos.includes('manafoil')) return 'Mana Foil'
  if (frames.includes('extendedart')) return 'Extended Art'
  if (c.border_color === 'borderless') return 'Borderless'
  if (frames.includes('showcase')) return 'Showcase'
  if (c.frame === '1997' || c.frame === '1993') return 'Retro Frame'
  return null
}

function parsePrices(c: ScryfallCard): { regular: number | null; foil: number | null } {
  const eur = c.prices?.eur ? Number(c.prices.eur) : usdToEur(c.prices?.usd)
  const foilRaw = c.prices?.eur_foil || c.prices?.eur_etched
  const foilUsd = c.prices?.usd_foil || c.prices?.usd_etched
  const foil = foilRaw ? Number(foilRaw) : usdToEur(foilUsd)
  return {
    regular: eur != null && Number.isFinite(eur) && eur > 0 ? Math.round(eur * 100) / 100 : null,
    foil: foil != null && Number.isFinite(foil) && foil > 0 ? Math.round(foil * 100) / 100 : null
  }
}

function defaultFloorPrice(rarity: string, isFoil: boolean, isLand: boolean): number {
  if (isLand) return isFoil ? 0.25 : 0.05
  if (rarity === 'mythic') return isFoil ? 1.5 : 0.75
  if (rarity === 'rare') return isFoil ? 0.5 : 0.2
  if (rarity === 'uncommon') return isFoil ? 0.2 : 0.08
  return isFoil ? 0.12 : 0.04
}

function buildSimulatedCard(
  c: ScryfallCard,
  slotLabel: string,
  isFoil: boolean,
  isLand: boolean,
  idx: number
): SimulatedPackCard {
  const { regular, foil } = parsePrices(c)
  let effective = isFoil ? (foil ?? (regular ? Math.round(regular * 1.35 * 100) / 100 : null)) : (regular ?? foil)
  if (effective == null || effective <= 0) {
    effective = defaultFloorPrice(c.rarity, isFoil, isLand)
  }
  const rarityNorm = (['common', 'uncommon', 'rare', 'mythic'].includes(c.rarity) ? c.rarity : 'rare') as SimulatedPackCard['rarity']
  return {
    uid: `${c.id}-${idx}-${isFoil ? 'foil' : 'reg'}`,
    id: c.id,
    name: c.name,
    rarity: rarityNorm,
    slotLabel,
    isLand,
    isFoil,
    treatment: extractTreatmentLabel(c),
    collectorNumber: c.collector_number || null,
    effectivePriceEur: effective,
    priceEur: regular,
    priceFoilEur: foil,
    imageUrl: getCardImageUrl(c),
    scryfallUrl: c.scryfall_uri || null
  }
}

function pickRandom<T>(arr: T[], usedIds?: Set<string>, fallbackArr?: T[]): T | null {
  const source = arr.length ? arr : fallbackArr || []
  if (!source.length) return null
  if (usedIds) {
    const unused = source.filter((item: any) => !usedIds.has(item.id))
    if (unused.length > 0) {
      const picked = unused[Math.floor(Math.random() * unused.length)] as any
      if (picked?.id) usedIds.add(picked.id)
      return picked
    }
  }
  const picked = source[Math.floor(Math.random() * source.length)] as any
  if (usedIds && picked?.id) usedIds.add(picked.id)
  return picked
}

async function resolveSetCode(rawCode: string, productId?: number, productName?: string): Promise<{ setCode: string; rawType: string; name: string }> {
  let name = productName || ''
  let rawType = ''
  if (productId && Number.isInteger(productId) && productId > 0) {
    const prod = await prisma.product.findUnique({
      where: { id: productId },
      select: { name: true, type: true }
    })
    if (prod) {
      name = prod.name
      rawType = prod.type || ''
    }
  }

  let code = rawCode.toLowerCase().trim()
  if (!code || code === 'lookup' || code === 'null' || code === 'undefined') {
    const scryfallMap = await getScryfallSetsMap()
    const clean = extractEditionName(name)
    const found = scryfallMap.get(clean)
    if (found?.code) {
      code = found.code.toLowerCase()
    } else {
      for (const [k, v] of scryfallMap.entries()) {
        if (k.length >= 5 && (clean.includes(k) || k.includes(clean))) {
          code = v.code.toLowerCase()
          break
        }
      }
    }
  }
  return { setCode: code, rawType, name }
}

async function fetchSetPool(setCode: string): Promise<ScryfallCard[]> {
  const cached = setPoolCache.get(setCode)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.cards
  }

  const all: ScryfallCard[] = []
  let nextUrl: string | null = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(`e:${setCode} -is:digital`)}&unique=prints`
  let pages = 0

  while (nextUrl && pages < 3) {
    pages++
    try {
      const res = await fetch(nextUrl, {
        headers: {
          'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)',
          Accept: 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      })
      if (!res.ok) break
      const json = (await res.json()) as { data?: ScryfallCard[]; has_more?: boolean; next_page?: string }
      if (Array.isArray(json.data)) {
        for (const c of json.data) {
          if (getCardImageUrl(c)) all.push(c)
        }
      }
      nextUrl = json.has_more && json.next_page ? json.next_page : null
    } catch {
      break
    }
  }

  if (all.length > 0) {
    setPoolCache.set(setCode, { timestamp: Date.now(), cards: all })
  }
  return all
}

export default defineEventHandler(async (event) => {
  const rawCode = getRouterParam(event, 'code') || ''
  const query = getQuery(event)
  const productId = query.productId ? Number(query.productId) : undefined
  const queryName = typeof query.name === 'string' ? query.name : ''
  const queryType = typeof query.type === 'string' ? query.type : ''

  const { setCode, rawType, name } = await resolveSetCode(rawCode, productId, queryName)
  if (!setCode || !/^[a-z0-9]{3,6}$/.test(setCode)) {
    return { ok: false, setCode: '', boosterType: 'DRAFT', recipeSummary: '', stats: null, cards: [] }
  }

  const effectiveTypeRaw = (queryType || rawType || '').toUpperCase()
  let boosterType: 'COLLECTOR' | 'PLAY' | 'SET' | 'DRAFT' = 'DRAFT'
  if (effectiveTypeRaw === 'COLLECTOR' || /\bcollector\b/i.test(name)) {
    boosterType = 'COLLECTOR'
  } else if (effectiveTypeRaw === 'PLAY' || /\bplay\s+booster\b/i.test(name)) {
    boosterType = 'PLAY'
  } else if (effectiveTypeRaw === 'SET' || /\bset\s+booster\b/i.test(name)) {
    boosterType = 'SET'
  } else {
    boosterType = 'DRAFT'
  }

  const pool = await fetchSetPool(setCode)
  if (!pool.length) {
    return { ok: false, setCode: setCode.toUpperCase(), boosterType, recipeSummary: '', stats: null, cards: [] }
  }

  // Filtrage selon le type de booster (les boosters non-Collector excluent les variantes Collector-only)
  const eligiblePool = boosterType === 'COLLECTOR' ? pool : pool.filter((c) => !isCollectorOnlyCard(c))

  // Séparation des cartes par rôle
  const allLands = eligiblePool.filter((c) => isLandCard(c))
  const basicOrCommonLands = allLands.filter((c) => isBasicLandCard(c) || c.rarity === 'common')
  const nonbasicRareLands = allLands.filter((c) => c.rarity === 'rare' || c.rarity === 'mythic' || (!isBasicLandCard(c) && c.rarity === 'uncommon'))

  const nonLands = eligiblePool.filter((c) => !isLandCard(c))
  const mainNonLands = nonLands.filter((c) => !isSpecialTreatmentCard(c))
  const specialPool = eligiblePool.filter((c) => isSpecialTreatmentCard(c))

  const commons = (mainNonLands.filter((c) => c.rarity === 'common').length
    ? mainNonLands.filter((c) => c.rarity === 'common')
    : nonLands.filter((c) => c.rarity === 'common'))
  const uncommons = (mainNonLands.filter((c) => c.rarity === 'uncommon').length
    ? mainNonLands.filter((c) => c.rarity === 'uncommon')
    : nonLands.filter((c) => c.rarity === 'uncommon'))
  const rares = (mainNonLands.filter((c) => c.rarity === 'rare').length
    ? mainNonLands.filter((c) => c.rarity === 'rare')
    : eligiblePool.filter((c) => c.rarity === 'rare'))
  const mythics = (mainNonLands.filter((c) => c.rarity === 'mythic').length
    ? mainNonLands.filter((c) => c.rarity === 'mythic')
    : eligiblePool.filter((c) => c.rarity === 'mythic'))

  const specialCU = specialPool.filter((c) => c.rarity === 'common' || c.rarity === 'uncommon')
  const specialRM = specialPool.filter((c) => c.rarity === 'rare' || c.rarity === 'mythic')

  const usedIds = new Set<string>()
  const pack: SimulatedPackCard[] = []

  const pickRareOrMythic = (mythicRate = 0.128, preferSpecial = false): ScryfallCard | null => {
    const isMythic = Math.random() < mythicRate && mythics.length > 0
    if (preferSpecial && specialRM.length > 0) {
      const spMythics = specialRM.filter((c) => c.rarity === 'mythic')
      const spRares = specialRM.filter((c) => c.rarity === 'rare')
      if (isMythic && spMythics.length > 0) return pickRandom(spMythics, usedIds, mythics)
      if (spRares.length > 0) return pickRandom(spRares, usedIds, rares)
    }
    return isMythic ? pickRandom(mythics, usedIds, rares) : pickRandom(rares, usedIds, mythics)
  }

  const pickWildcard = (allowSpecial = true): ScryfallCard | null => {
    const roll = Math.random()
    if (roll < 0.025 && mythics.length) return pickRandom(mythics, usedIds, rares)
    if (roll < 0.14 && rares.length) return pickRandom(rares, usedIds, uncommons)
    if (allowSpecial && roll < 0.30 && specialPool.length) return pickRandom(specialPool, usedIds, uncommons)
    if (roll < 0.55 && uncommons.length) return pickRandom(uncommons, usedIds, commons)
    return pickRandom(commons, usedIds, eligiblePool)
  }

  // ============================================================================
  // SLOT 1 : TERRAIN GARANTI (100 % des boosters ont 1 slot Terrain dédié)
  // ============================================================================
  let landCard: ScryfallCard | null = null
  // Dans certains sets (MH2, RVR, KTK, DGM, etc.), le slot terrain peut upgrader en terrain rare/non-basique (~6%)
  if (nonbasicRareLands.length > 0 && Math.random() < (boosterType === 'COLLECTOR' ? 0.18 : 0.06)) {
    landCard = pickRandom(nonbasicRareLands, usedIds, allLands)
  } else if (basicOrCommonLands.length > 0) {
    landCard = pickRandom(basicOrCommonLands, usedIds, allLands)
  } else if (allLands.length > 0) {
    landCard = pickRandom(allLands, usedIds, eligiblePool)
  } else {
    // Si l'extension sur Scryfall n'a pas de terrains basiques listés, on pioche un terrain générique ou la 1re carte
    landCard = pickRandom(eligiblePool, usedIds)
  }

  const isLandFoil =
    boosterType === 'COLLECTOR'
      ? true
      : boosterType === 'PLAY' || boosterType === 'SET'
        ? Math.random() < 0.20
        : Math.random() < 0.10

  if (landCard) {
    pack.push(
      buildSimulatedCard(
        landCard,
        isLandFoil ? 'Slot #1 · Terrain Foil' : 'Slot #1 · Terrain',
        isLandFoil,
        true,
        1
      )
    )
  }

  let recipeSummary = ''

  // ============================================================================
  // SLOTS 2 à 15 SELON LE TYPE DE BOOSTER ET LES RATIOS DU SET
  // ============================================================================
  if (boosterType === 'COLLECTOR') {
    recipeSummary = `Booster Collector ${setCode.toUpperCase()} · 15 cartes : 1 Terrain Foil, 4 Communes Foil, 2 Uncos Foil, 3 Variantes C/U, 4 Rares/Mythiques (dont 2 Foils) et 1 Variante Foil`

    // Slots 2-5 : 4 Foil Commons
    for (let i = 0; i < 4; i++) {
      const c = pickRandom(commons, usedIds, eligiblePool)
      if (c) pack.push(buildSimulatedCard(c, 'Commune Foil', true, false, pack.length + 1))
    }
    // Slots 6-7 : 2 Foil Uncommons
    for (let i = 0; i < 2; i++) {
      const c = pickRandom(uncommons, usedIds, commons)
      if (c) pack.push(buildSimulatedCard(c, 'Unco Foil', true, false, pack.length + 1))
    }
    // Slots 8-10 : 3 Showcase / Borderless / Retro C/U
    for (let i = 0; i < 3; i++) {
      const c = pickRandom(specialCU.length ? specialCU : uncommons, usedIds, eligiblePool)
      if (c) pack.push(buildSimulatedCard(c, 'Showcase / Retro C/U', false, false, pack.length + 1))
    }
    // Slot 11 : 1 Foil Rare ou Mythique (principale)
    const foilRM = pickRareOrMythic(0.14, false)
    if (foilRM) pack.push(buildSimulatedCard(foilRM, 'Rare / Mythique Foil', true, false, pack.length + 1))

    // Slot 12 : 1 Extended Art / Special Rare ou Mythique (Non-Foil)
    const extRM = pickRareOrMythic(0.14, true)
    if (extRM) pack.push(buildSimulatedCard(extRM, 'Extended / Borderless R/M', false, false, pack.length + 1))

    // Slot 13 : 1 Showcase / Borderless / Retro Rare ou Mythique (Non-Foil)
    const showRM = pickRareOrMythic(0.14, true)
    if (showRM) pack.push(buildSimulatedCard(showRM, 'Showcase / Retro R/M', false, false, pack.length + 1))

    // Slot 14 : 1 Foil Showcase / Retro (Unco ou Rare/Mythique)
    const foilShow = Math.random() < 0.35 ? pickRareOrMythic(0.15, true) : pickRandom(specialCU.length ? specialCU : uncommons, usedIds, eligiblePool)
    if (foilShow) pack.push(buildSimulatedCard(foilShow, 'Variante Foil', true, false, pack.length + 1))

    // Slot 15 : 1 Foil Extended Art / Borderless / Showcase Rare ou Mythique (Le "Big Hit" Collector)
    const topFoilRM = pickRareOrMythic(0.16, true)
    if (topFoilRM) pack.push(buildSimulatedCard(topFoilRM, 'Hit Collector R/M Foil', true, false, pack.length + 1))
  } else if (boosterType === 'PLAY') {
    recipeSummary = `Play Booster ${setCode.toUpperCase()} · 15 cartes : 1 Terrain (20% Foil), 6 Communes, 3 Uncos, 2 Wildcards (jusqu'à 4 Rares/Mythiques possibles), 1 Foil garantie & 1 slot Booster Fun`

    // Slots 2-7 : 6 Commons
    for (let i = 0; i < 6; i++) {
      const c = pickRandom(commons, usedIds, eligiblePool)
      if (c) pack.push(buildSimulatedCard(c, 'Commune', false, false, pack.length + 1))
    }
    // Slots 8-10 : 3 Uncommons
    for (let i = 0; i < 3; i++) {
      const c = pickRandom(uncommons, usedIds, commons)
      if (c) pack.push(buildSimulatedCard(c, 'Unco', false, false, pack.length + 1))
    }
    // Slot 11 : 1 Wildcard Non-Foil (peut upgrader en Rare/Mythique)
    const wc1 = pickWildcard(true)
    if (wc1) pack.push(buildSimulatedCard(wc1, 'Wildcard', false, false, pack.length + 1))

    // Slot 12 : 1 Booster Fun / Bonus Sheet / Showcase (14% de chance d'être Rare/Mythique)
    const bfCard =
      Math.random() < 0.16
        ? pickRareOrMythic(0.14, true)
        : pickRandom(specialPool.length ? specialPool : commons, usedIds, eligiblePool)
    if (bfCard) pack.push(buildSimulatedCard(bfCard, 'Slot Booster Fun / Bonus', false, false, pack.length + 1))

    // Slot 13 : 1 Rare ou Mythique garantie (7/8 Rare, 1/8 Mythique)
    const mainRM = pickRareOrMythic(0.128, false)
    if (mainRM) pack.push(buildSimulatedCard(mainRM, 'Rare / Mythique', false, false, pack.length + 1))

    // Slot 14 : 1 Foil Traditionnelle garantie (toutes raretés)
    const foilWc = pickWildcard(true)
    if (foilWc) pack.push(buildSimulatedCard(foilWc, 'Wildcard Foil Garantie', true, false, pack.length + 1))

    // Slot 15 : 7e Commune / The List / Special Guest (~12% upgrade)
    const slot15 = Math.random() < 0.12 ? pickWildcard(true) : pickRandom(commons, usedIds, eligiblePool)
    if (slot15) pack.push(buildSimulatedCard(slot15, 'Slot Playable / The List', false, false, pack.length + 1))
  } else if (boosterType === 'SET') {
    recipeSummary = `Set Booster ${setCode.toUpperCase()} · 15 cartes : 1 Terrain (20% Foil), 5 Communes, 3 Uncos, 2 slots Showcase, 2 Wildcards, 1 Rare/Mythique & 1 Foil garantie`

    // Slots 2-6 : 5 Commons
    for (let i = 0; i < 5; i++) {
      const c = pickRandom(commons, usedIds, eligiblePool)
      if (c) pack.push(buildSimulatedCard(c, 'Commune', false, false, pack.length + 1))
    }
    // Slots 7-9 : 3 Uncommons
    for (let i = 0; i < 3; i++) {
      const c = pickRandom(uncommons, usedIds, commons)
      if (c) pack.push(buildSimulatedCard(c, 'Unco', false, false, pack.length + 1))
    }
    // Slots 10-11 : 2 Showcase / Head-Turning slots
    for (let i = 0; i < 2; i++) {
      const c = pickRandom(specialCU.length ? specialCU : uncommons, usedIds, eligiblePool)
      if (c) pack.push(buildSimulatedCard(c, 'Slot Showcase / Thématique', false, false, pack.length + 1))
    }
    // Slots 12-13 : 2 Wildcards (toutes raretés)
    for (let i = 0; i < 2; i++) {
      const wc = pickWildcard(true)
      if (wc) pack.push(buildSimulatedCard(wc, `Wildcard #${i + 1}`, false, false, pack.length + 1))
    }
    // Slot 14 : 1 Rare ou Mythique principale
    const mainRM = pickRareOrMythic(0.135, false)
    if (mainRM) pack.push(buildSimulatedCard(mainRM, 'Rare / Mythique', false, false, pack.length + 1))

    // Slot 15 : 1 Foil garantie (toutes raretés)
    const foilCard = pickWildcard(true)
    if (foilCard) pack.push(buildSimulatedCard(foilCard, 'Foil Garantie', true, false, pack.length + 1))
  } else {
    // DRAFT BOOSTER (adapté selon Double Masters / Masters / Standard Draft)
    const isDoubleMasters = DOUBLE_MASTERS_SETS.has(setCode)
    const hasGuaranteedFoil = isDoubleMasters || GUARANTEED_FOIL_DRAFT_SETS.has(setCode)
    const foilProbability = hasGuaranteedFoil ? 1.0 : 0.333 // 1 booster sur 3 en Draft Standard

    if (isDoubleMasters) {
      recipeSummary = `Booster Draft Double Masters (${setCode.toUpperCase()}) · 15 cartes : 1 Terrain, 8 Communes, 2 Uncos, 2 Rares/Mythiques garanties & 2 Foils garanties`
      // 8 Commons
      for (let i = 0; i < 8; i++) {
        const c = pickRandom(commons, usedIds, eligiblePool)
        if (c) pack.push(buildSimulatedCard(c, 'Commune', false, false, pack.length + 1))
      }
      // 2 Uncommons
      for (let i = 0; i < 2; i++) {
        const c = pickRandom(uncommons, usedIds, commons)
        if (c) pack.push(buildSimulatedCard(c, 'Unco', false, false, pack.length + 1))
      }
      // 2 Rares/Mythics
      for (let i = 0; i < 2; i++) {
        const rm = pickRareOrMythic(0.135, false)
        if (rm) pack.push(buildSimulatedCard(rm, `Rare / Mythique #${i + 1}`, false, false, pack.length + 1))
      }
      // 2 Foils
      for (let i = 0; i < 2; i++) {
        const f = pickWildcard(true)
        if (f) pack.push(buildSimulatedCard(f, `Foil Garantie #${i + 1}`, true, false, pack.length + 1))
      }
    } else {
      const hasFoilThisPack = Math.random() < foilProbability
      recipeSummary = hasGuaranteedFoil
        ? `Booster Draft Masters/Remastered (${setCode.toUpperCase()}) · 15 cartes : 1 Terrain, 9 Communes, 3 Uncos, 1 Rare/Mythique & 1 Foil garantie (100%)`
        : `Booster Draft Standard (${setCode.toUpperCase()}) · 15 cartes : 1 Terrain, ${hasFoilThisPack ? '9 Communes + 1 Foil tirée (ratio 1:3)' : '10 Communes (pas de Foil sur ce tirage, ratio 1:3)'}, 3 Uncos & 1 Rare/Mythique`

      const commonsCount = hasFoilThisPack ? 9 : 10
      for (let i = 0; i < commonsCount; i++) {
        const c = pickRandom(commons, usedIds, eligiblePool)
        if (c) pack.push(buildSimulatedCard(c, 'Commune', false, false, pack.length + 1))
      }
      // 3 Uncommons
      for (let i = 0; i < 3; i++) {
        const c = pickRandom(uncommons, usedIds, commons)
        if (c) pack.push(buildSimulatedCard(c, 'Unco', false, false, pack.length + 1))
      }
      // 1 Rare / Mythic
      const mainRM = pickRareOrMythic(0.125, false)
      if (mainRM) pack.push(buildSimulatedCard(mainRM, 'Rare / Mythique', false, false, pack.length + 1))

      // 1 Foil (si tirée selon le ratio du set)
      if (hasFoilThisPack) {
        const foilCard = pickWildcard(true)
        if (foilCard) pack.push(buildSimulatedCard(foilCard, hasGuaranteedFoil ? 'Foil Garantie' : 'Foil (1:3 boosters)', true, false, pack.length + 1))
      }
    }
  }

  // Sécurité : garantit exactement 15 cartes dans tous les cas
  while (pack.length < 15) {
    const extra = pickRandom(commons.length ? commons : eligiblePool, usedIds, eligiblePool)
    if (!extra) break
    pack.push(buildSimulatedCard(extra, 'Commune', false, false, pack.length + 1))
  }
  const finalPack = pack.slice(0, 15)

  const totalValueEur = Math.round(finalPack.reduce((acc, c) => acc + c.effectivePriceEur, 0) * 100) / 100
  const foilCount = finalPack.filter((c) => c.isFoil).length
  const rareMythicCount = finalPack.filter((c) => c.rarity === 'rare' || c.rarity === 'mythic').length

  return {
    ok: true,
    setCode: setCode.toUpperCase(),
    boosterType,
    recipeSummary,
    stats: {
      totalCards: finalPack.length,
      foilCount,
      rareMythicCount,
      totalValueEur
    },
    cards: finalPack
  }
})

