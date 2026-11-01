import { ProductCategory, BoosterType } from '@prisma/client'
import { prisma } from './prisma'

interface ScryfallSet {
  code: string
  name: string
  released_at?: string
  set_type?: string
  card_count?: number
  parent_set_code?: string
  digital?: boolean
}

interface ScryfallCard {
  id: string
  name: string
  set: string
  collector_number?: string
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic' | 'special' | 'bonus'
  booster?: boolean
  promo?: boolean
  promo_types?: string[]
  frame_effects?: string[]
  finishes?: string[]
  prices?: {
    eur?: string | null
    eur_foil?: string | null
    usd?: string | null
    usd_foil?: string | null
  }
}

interface MtgjsonSealedProduct {
  uuid?: string
  name?: string
  category?: string
  subtype?: string
  count?: number
  releaseDate?: string
  identifiers?: {
    mcmId?: string | number
    tcgplayerProductId?: string | number
  }
  contents?: {
    pack?: Array<{ code?: string; set?: string }>
    sealed?: Array<{ count?: number; name?: string; set?: string; uuid?: string }>
  }
}

interface MtgjsonSet {
  code: string
  name: string
  releaseDate?: string
  baseSetSize?: number
  totalSetSize?: number
  type?: string
  sealedProduct?: MtgjsonSealedProduct[]
}

export interface SetEvMetrics {
  code: string
  name: string
  releaseYear: number
  /** EV par booster en EUR selon le type de booster */
  packEv: {
    DRAFT: number
    PLAY: number
    SET: number
    COLLECTOR: number
  }
  /** Nombre de boosters par défaut dans une boîte de ce set */
  defaultBoxPacks: {
    DRAFT: number
    PLAY: number
    SET: number
    COLLECTOR: number
    BUNDLE: number
  }
  source: 'scryfall+cardmarket' | 'dawnglare+tcglow' | 'hybrid'
}

/**
 * Normalise une chaîne pour comparaison stricte (sans accents ni ponctuation).
 */
function normStrict(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Nettoie un nom de produit scellé (boîte, bundle, booster) pour extraire le nom de l'extension,
 * TOUT EN PRÉSERVANT les mots-clés d'extension critiques (Commander Legends, Remastered, Horizons, Masters, etc.).
 */
export function extractEditionName(rawName: string): string {
  return rawName
    .replace(/\buniverses\s+beyond\s*:\s*/gi, '')
    .replace(/\b(?:draft|play|set|collector|theme|jumpstart|beyond)\s+booster\s+(?:box|display|pack)\b/gi, '')
    .replace(/\b(?:draft|play|set|collector|theme|jumpstart|beyond)\s+booster\b/gi, '')
    .replace(/\bbooster\s+(?:box|display|pack)\b/gi, '')
    .replace(/\b(?:secret\s+lair\s+bundle|gift\s+edition\s+bundle|gift\s+bundle|compleat\s+edition\s+bundle|nightmare\s+bundle|bundle|fat\s*pack)\b/gi, '')
    .replace(/\b(?:booster|display|box)\b/gi, '')
    .replace(/[-–—:]+$/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const QUALIFIER_WORDS = [
  'remastered',
  'aftermath',
  'horizons',
  'masters',
  'legends',
  'united',
  'allegiance',
  'reborn',
  'besieged',
  'ascension',
  'restored',
  'vow',
  'hunt',
  'baldurs',
  'dragonstorm',
  'conspiracy',
  'unfinity',
  'unsanctioned',
  'unstable',
  'unhinged',
  'unglued'
]

/**
 * Vérifie que deux noms normalisés ont exactement les mêmes qualificatifs critiques et numéros
 * (évite que "Time Spiral" ne matche "Time Spiral Remastered", ou "Modern Horizons" -> "Modern Horizons 2").
 */
function hasCompatibleQualifiers(normA: string, normB: string): boolean {
  const numsA = normA.match(/\b\d+\b/g) || []
  const numsB = normB.match(/\b\d+\b/g) || []
  if (numsA.length !== numsB.length || !numsA.every((n, i) => n === numsB[i])) {
    return false
  }
  const wordsA = new Set(normA.split(' '))
  const wordsB = new Set(normB.split(' '))
  for (const q of QUALIFIER_WORDS) {
    if (wordsA.has(q) !== wordsB.has(q)) {
      return false
    }
  }
  return true
}

function isBundleProduct(p: { type?: string; name: string }): boolean {
  return (p.type as string) === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(p.name)
}

function isGiftOrSpecialBundle(name: string): boolean {
  return /\b(?:gift|compleat|nightmare)\b/i.test(name)
}

/**
 * Extensions principales dotées d'une "Bonus Sheet" dédiée (1 carte bonus par booster).
 */
const BONUS_SHEET_BY_SET: Record<string, string> = {
  stx: 'sta', // Strixhaven -> Mystical Archive
  bro: 'brr', // The Brothers' War -> Retro Artifacts
  mom: 'mul', // March of the Machine -> Multiverse Legends
  woe: 'wot', // Wilds of Eldraine -> Enchanting Tales
  otj: 'otp'  // Outlaws of Thunder Junction -> Breaking News
}

/**
 * Extensions Masters / Spéciales dont les boîtes Draft contiennent 24 boosters (au lieu de 36).
 */
const TWENTY_FOUR_PACK_SETS = new Set([
  'mma', 'mm2', 'mm3', 'ema', 'ima', 'a25', 'uma', '2xm', '2x2', 'cmm',
  'cmr', 'clb', 'bbd', 'cn2', 'cns', 'acr', 'mat'
])

/**
 * Extensions Collector dont les boîtes contiennent 4 boosters (au lieu de 12).
 */
const FOUR_PACK_COLLECTOR_SETS = new Set(['2x2', 'cmm'])

/**
 * Détermine le nombre exact de boosters contenus dans un produit scellé.
 */
function resolvePackCount(
  product: { name: string; category: string; type: string },
  setCode: string,
  releaseYear: number,
  releaseDate: Date | null,
  mtgjsonSp?: MtgjsonSealedProduct
): { packCount: number; effectivePackType: 'DRAFT' | 'PLAY' | 'SET' | 'COLLECTOR'; extraCollectorPacks: number } {
  const cat = product.category || 'BOOSTER_BOX'
  const rawType = product.type || 'DRAFT'

  // 1. Booster individuel
  if (cat === 'SINGLE_BOOSTER') {
    const t = (rawType === 'PLAY' || rawType === 'SET' || rawType === 'COLLECTOR') ? rawType : 'DRAFT'
    return { packCount: 1, effectivePackType: t, extraCollectorPacks: 0 }
  }

  // 2. Bundle / Fat Pack
  if (isBundleProduct(product)) {
    const effectivePackType: 'DRAFT' | 'PLAY' | 'SET' =
      releaseDate && releaseDate >= new Date('2024-02-01')
        ? 'PLAY'
        : releaseDate && releaseDate >= new Date('2021-09-01')
          ? 'SET'
          : 'DRAFT'

    const extraCollector = isGiftOrSpecialBundle(product.name) ? 1 : 0

    // Si MTGJSON indique le nombre exact de boosters dans le bundle
    if (mtgjsonSp?.count && mtgjsonSp.count >= 6 && mtgjsonSp.count <= 12) {
      return { packCount: mtgjsonSp.count, effectivePackType, extraCollectorPacks: extraCollector }
    }
    if (mtgjsonSp?.contents?.pack?.length && mtgjsonSp.contents.pack.length >= 6 && mtgjsonSp.contents.pack.length <= 12) {
      return { packCount: mtgjsonSp.contents.pack.length, effectivePackType, extraCollectorPacks: extraCollector }
    }

    let defaultBundlePacks = 9
    if (effectivePackType === 'PLAY') defaultBundlePacks = 9
    else if (effectivePackType === 'SET') defaultBundlePacks = 8
    else if (releaseYear >= 2016) defaultBundlePacks = 10
    else if (releaseYear >= 2009) defaultBundlePacks = 9
    else defaultBundlePacks = 6

    return { packCount: defaultBundlePacks, effectivePackType, extraCollectorPacks: extraCollector }
  }

  // 3. Boîte de boosters (Draft, Play, Set, Collector)
  const effectivePackType: 'DRAFT' | 'PLAY' | 'SET' | 'COLLECTOR' =
    (rawType === 'PLAY' || rawType === 'SET' || rawType === 'COLLECTOR') ? rawType : 'DRAFT'

  // Vérification via MTGJSON sealedProduct
  if (mtgjsonSp) {
    if (mtgjsonSp.count && mtgjsonSp.count >= 4 && mtgjsonSp.count <= 36) {
      return { packCount: mtgjsonSp.count, effectivePackType, extraCollectorPacks: 0 }
    }
    if (mtgjsonSp.contents?.sealed?.length) {
      const totalPacks = mtgjsonSp.contents.sealed.reduce((acc, s) => acc + (Number(s.count) || 0), 0)
      if (totalPacks >= 4 && totalPacks <= 36) {
        return { packCount: totalPacks, effectivePackType, extraCollectorPacks: 0 }
      }
    }
  }

  if (effectivePackType === 'COLLECTOR') {
    const packs = FOUR_PACK_COLLECTOR_SETS.has(setCode) ? 4 : 12
    return { packCount: packs, effectivePackType, extraCollectorPacks: 0 }
  }

  if (effectivePackType === 'SET') {
    if (setCode === 'cmm') return { packCount: 24, effectivePackType, extraCollectorPacks: 0 }
    if (/\bjumpstart\b/i.test(product.name)) return { packCount: 24, effectivePackType, extraCollectorPacks: 0 }
    return { packCount: 30, effectivePackType, extraCollectorPacks: 0 }
  }

  if (effectivePackType === 'PLAY') {
    // À partir de février 2025 (Aetherdrift), les boîtes Play Booster passent de 36 à 30 boosters
    if (releaseDate && releaseDate >= new Date('2025-02-01') && setCode !== 'inr') {
      return { packCount: 30, effectivePackType, extraCollectorPacks: 0 }
    }
    return { packCount: 36, effectivePackType, extraCollectorPacks: 0 }
  }

  // DRAFT
  if (TWENTY_FOUR_PACK_SETS.has(setCode) || /\b(?:masters|horizons\s+1|commander\s+legends|conspiracy|battlebond|aftermath|assassin)\b/i.test(product.name)) {
    // Note: Modern Horizons 1 & 2 Draft boxes ont 36 boosters, Masters & Commander Legends ont 24
    if (!/\bmodern\s+horizons\b/i.test(product.name)) {
      return { packCount: 24, effectivePackType, extraCollectorPacks: 0 }
    }
  }

  return { packCount: 36, effectivePackType, extraCollectorPacks: 0 }
}

/**
 * Récupère les EV de référence depuis Dawnglare (en mode tcg_low et tcg_market, jamais tcg_mid qui est gonflé),
 * en filtrant strictement les variantes "lottery / Priceless Treasures / Expeditions / Inventions".
 */
async function fetchDawnglareEvMap(): Promise<Map<string, number>> {
  const evByNormName = new Map<string, number>()
  const USD_TO_EUR = 0.90

  for (const source of ['tcg_low', 'tcg_market']) {
    try {
      const res = await fetch(`https://mtg.dawnglare.com/?p=sets&source=${source}`, {
        signal: AbortSignal.timeout(10000)
      })
      if (!res.ok) continue
      const html = await res.text()

      const regex = /<div class="cP"[^>]*>\$([\d,.]+)<\/div><div class="cN">(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/div>/gi
      let m
      while ((m = regex.exec(html)) !== null) {
        const valUsd = parseFloat(m[1].replace(/,/g, ''))
        const rawSetName = m[2].trim()

        // Ignorer impérativement les lignes "lottery" ou "Foil" qui faussent l'EV des boîtes standard
        if (/\b(?:w\/|without|priceless|expeditions|inventions|invocations|masterpieces|foil)\b/i.test(rawSetName)) {
          continue
        }

        const norm = normStrict(extractEditionName(rawSetName))
        if (norm && Number.isFinite(valUsd) && valUsd > 0 && valUsd < 2500) {
          const valEur = Math.round(valUsd * USD_TO_EUR * 100) / 100
          if (!evByNormName.has(norm)) {
            evByNormName.set(norm, valEur)
          }
        }
      }
      if (evByNormName.size > 20) break
    } catch (err: any) {
      console.warn(`[EV Sync] Avertissement Dawnglare (${source}) :`, err?.message || err)
    }
  }

  return evByNormName
}

const LOTTERY_PROMO_TYPES = new Set([
  'serialized',
  'textured',
  'neonink',
  'halofoil',
  'raisedfoil',
  'fracturefoil',
  'confettifoil',
  'galaxyfoil',
  'gilded',
  'manafoil',
  'headliner',
  'surgefoil',
  'doubleexposure',
  'invisibleink',
  'stepandcompleat',
  'oillick'
])

const EXCLUDED_BOOSTER_PROMOS = new Set([
  'buyabox',
  'prerelease',
  'bundle',
  'datestamped',
  'promopack',
  'starterdeck',
  ' commanderparty',
  'storechampionship',
  'bringafriend'
])

/**
 * Télécharge en lots depuis l'API officielle Scryfall toutes les cartes valorisées (>= 0.50 €)
 * pour la liste de codes d'extensions fournie.
 */
async function fetchScryfallCardsBySetCodes(setCodes: string[]): Promise<Map<string, ScryfallCard[]>> {
  const cardsBySet = new Map<string, ScryfallCard[]>()
  for (const c of setCodes) cardsBySet.set(c, [])

  // Lots de 7 sets par requête Scryfall (réduit ~120 sets à ~17 requêtes rapides)
  const BATCH_SIZE = 7
  for (let i = 0; i < setCodes.length; i += BATCH_SIZE) {
    const batch = setCodes.slice(i, i + BATCH_SIZE)
    const setOrClause = batch.map((c) => `e:${c}`).join(' or ')
    const query = `(${setOrClause}) -is:digital (eur>=0.50 or eur_foil>=1.50 or usd>=0.55)`
    let nextUrl: string | null = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&unique=prints`
    let pageCount = 0

    while (nextUrl && pageCount < 4) {
      pageCount++
      try {
        const rawRes = await fetch(nextUrl, {
          headers: {
            'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)',
            Accept: 'application/json'
          },
          signal: AbortSignal.timeout(10000)
        })
        if (!rawRes.ok) {
          nextUrl = null
          break
        }
        const res = (await rawRes.json()) as {
          data?: ScryfallCard[]
          has_more?: boolean
          next_page?: string
        }

        for (const card of res.data || []) {
          const code = (card.set || '').toLowerCase()
          if (cardsBySet.has(code)) {
            cardsBySet.get(code)!.push(card)
          }
        }

        nextUrl = res.has_more && res.next_page ? res.next_page : null
        if (nextUrl) {
          await new Promise((r) => setTimeout(r, 85))
        }
      } catch (err: any) {
        // 404 sur Scryfall signifie simplement qu'aucune carte du lot ne dépasse le seuil
        nextUrl = null
      }
    }

    await new Promise((r) => setTimeout(r, 85))
  }

  return cardsBySet
}

/**
 * Calcule l'EV d'un booster (en EUR) à partir des cartes Scryfall (prix Cardmarket EUR)
 * et des tailles de planches officielles de l'extension.
 */
function computeSetPackEvFromScryfall(
  code: string,
  cards: ScryfallCard[],
  bonusCards: ScryfallCard[],
  baseSetSize: number,
  releaseDate: Date | null
): { DRAFT: number; PLAY: number; SET: number; COLLECTOR: number } | null {
  const BULK_CUTOFF_EUR = 0.50
  const USD_TO_EUR = 0.90

  // Déduplication par nom de carte pour les boosters standard (Draft/Play/Set)
  // afin que les variantes Showcase/Borderless/Retro ne multiplient pas la probabilité de tirage d'une carte
  const baseCardByName = new Map<string, { rarity: string; priceEur: number; foilEur: number }>()
  // Pour les Collector Boosters, on conserve aussi le prix moyen des variantes alternatives / foils
  const collectorCardByName = new Map<string, { rarity: string; maxAltPrice: number; foilPrice: number }>()

  const hasBoosterTaggedCards = cards.some((c) => c.booster === true)

  for (const c of cards) {
    const promos = c.promo_types || []
    if (promos.some((p) => EXCLUDED_BOOSTER_PROMOS.has(p))) continue
    const isLottery = promos.some((p) => LOTTERY_PROMO_TYPES.has(p))

    const pEur = c.prices?.eur
      ? parseFloat(c.prices.eur)
      : c.prices?.usd
        ? parseFloat(c.prices.usd) * USD_TO_EUR
        : 0
    const pFoil = c.prices?.eur_foil
      ? parseFloat(c.prices.eur_foil)
      : c.prices?.usd_foil
        ? parseFloat(c.prices.usd_foil) * USD_TO_EUR
        : pEur * 1.25

    const validEur = Number.isFinite(pEur) && pEur > 0 && pEur < 600 ? pEur : 0
    const validFoil = Number.isFinite(pFoil) && pFoil > 0 && pFoil < 800 ? pFoil : 0

    const key = c.name.toLowerCase().trim()

    // Enregistrement pour Collector Booster (hors cartes sérialisées / lottery < 0.01%)
    if (!isLottery && (validEur >= BULK_CUTOFF_EUR || validFoil >= 1.0)) {
      const prevCol = collectorCardByName.get(key)
      if (!prevCol) {
        collectorCardByName.set(key, {
          rarity: c.rarity,
          maxAltPrice: validEur,
          foilPrice: validFoil || validEur
        })
      } else {
        // Moyenne pondérée douce entre la version de base et la variante Showcase/Extended Art
        prevCol.maxAltPrice = Math.min(prevCol.maxAltPrice * 0.65 + validEur * 0.35, prevCol.maxAltPrice * 1.6)
        if (validFoil > 0) {
          prevCol.foilPrice = prevCol.foilPrice > 0 ? Math.min(prevCol.foilPrice, validFoil) : validFoil
        }
      }
    }

    // Pour les boosters standard (Draft / Play / Set), seules les cartes présentes en booster comptent
    if (hasBoosterTaggedCards && !c.booster) continue
    if (c.promo || isLottery) continue

    if (validEur < BULK_CUTOFF_EUR) continue

    const existing = baseCardByName.get(key)
    if (!existing) {
      baseCardByName.set(key, {
        rarity: c.rarity,
        priceEur: validEur,
        foilEur: validFoil
      })
    } else {
      // Toujours retenir la version régulière (la moins chère) pour le calcul du booster standard
      if (validEur < existing.priceEur) {
        existing.priceEur = validEur
      }
      if (validFoil > 0 && (existing.foilEur === 0 || validFoil < existing.foilEur)) {
        existing.foilEur = validFoil
      }
    }
  }

  if (baseCardByName.size === 0) return null

  let sumRares = 0
  let sumMythics = 0
  let sumUncommons = 0
  let sumCommons = 0
  let sumSpecial = 0
  let sumFoilRM = 0

  let countPricedRares = 0
  let countPricedMythics = 0
  let countPricedSpecial = 0

  for (const item of baseCardByName.values()) {
    if (item.rarity === 'mythic') {
      sumMythics += item.priceEur
      sumFoilRM += item.foilEur > 0 ? item.foilEur : item.priceEur * 1.25
      countPricedMythics++
    } else if (item.rarity === 'rare') {
      sumRares += item.priceEur
      sumFoilRM += (item.foilEur > 0 ? item.foilEur : item.priceEur * 1.2) * 2
      countPricedRares++
    } else if (item.rarity === 'uncommon') {
      sumUncommons += item.priceEur
    } else if (item.rarity === 'common') {
      sumCommons += item.priceEur
    } else if (item.rarity === 'special' || item.rarity === 'bonus') {
      sumSpecial += item.priceEur
      countPricedSpecial++
    }
  }

  const releaseYear = releaseDate ? releaseDate.getFullYear() : 2020
  const isPreMythic = releaseDate ? releaseDate < new Date('2008-09-25') : false
  const isModernSheet = releaseDate ? releaseDate >= new Date('2020-09-01') : true
  const effSetSize = baseSetSize && baseSetSize >= 40 ? baseSetSize : 260

  // Détermination précise de la taille des planches Rare (N_R) et Mythique (N_M)
  let totalRares: number
  let totalMythics: number
  let totalUncommons = Math.max(80, Math.round(effSetSize * 0.32))
  let totalCommons = Math.max(80, Math.round(effSetSize * 0.38))

  if (isPreMythic) {
    totalMythics = 0
    totalRares = Math.max(countPricedRares, Math.round(effSetSize * 0.32), 45)
  } else if (effSetSize <= 70) {
    // Mini-sets (ex: March of the Machine: The Aftermath)
    totalRares = Math.max(countPricedRares, 25)
    totalMythics = Math.max(countPricedMythics, 10)
    totalUncommons = 25
  } else if (effSetSize <= 130) {
    // Petits sets spéciaux (ex: Assassin's Creed)
    totalRares = Math.max(countPricedRares, 35)
    totalMythics = Math.max(countPricedMythics, 12)
    totalUncommons = 40
  } else if (effSetSize < 205) {
    // Petits sets classiques (ex: Worldwake, Born of the Gods, Aether Revolt)
    totalRares = Math.max(countPricedRares, 35)
    totalMythics = Math.max(countPricedMythics, 10)
    totalUncommons = 60
  } else if (isModernSheet) {
    // Extensions modernes depuis Zendikar Rising (60 Rares, 20 Mythiques)
    totalRares = Math.max(countPricedRares, 60)
    totalMythics = Math.max(countPricedMythics, 20)
    totalUncommons = Math.max(80, Math.round(effSetSize * 0.33))
  } else {
    // Planche classique de 121 cartes (53 Rares x 2 + 15 Mythiques x 1 = 121)
    totalRares = Math.max(countPricedRares, 53)
    totalMythics = Math.max(countPricedMythics, 15)
  }

  const rmSheetDenominator = 2 * totalRares + totalMythics
  if (rmSheetDenominator <= 0) return null

  // 1. Espérance mathématique du slot Rare / Mythique principal
  const rmSlotEv = (2 * sumRares + sumMythics) / rmSheetDenominator

  // 2. Espérance des 3 slots Uncommon et 10 slots Common (cartes >= 0.50 € uniquement)
  const uncommonSlotEv = (3 * sumUncommons) / totalUncommons
  const commonSlotEv = (10 * sumCommons) / totalCommons

  // 3. Contribution du slot Special / Timeshifted interne au set (ex: Time Spiral Remastered = 121 cartes Timeshifted)
  let specialSlotEv = 0
  if (countPricedSpecial > 0) {
    const totalSpecial = code === 'tsr' ? 121 : Math.max(countPricedSpecial, 40)
    specialSlotEv = sumSpecial / totalSpecial
  }

  // 4. Contribution d'une Bonus Sheet dédiée (ex: STA, BRR, MUL, WOT, OTP : 1 carte par booster)
  let bonusSheetEv = 0
  if (bonusCards.length > 0) {
    const bonusDedup = new Map<string, { rarity: string; price: number }>()
    for (const bc of bonusCards) {
      const p = bc.prices?.eur
        ? parseFloat(bc.prices.eur)
        : bc.prices?.usd
          ? parseFloat(bc.prices.usd) * USD_TO_EUR
          : 0
      if (!Number.isFinite(p) || p < BULK_CUTOFF_EUR || p > 500) continue
      const k = bc.name.toLowerCase().trim()
      const ex = bonusDedup.get(k)
      if (!ex || p < ex.price) {
        bonusDedup.set(k, { rarity: bc.rarity, price: p })
      }
    }
    // Une planche bonus (63 cartes type STA/BRR/WOT/MUL/OTP) a typiquement ~67% Uncommon, ~26% Rare, ~7% Mythic
    let bU = 0, bR = 0, bM = 0
    for (const b of bonusDedup.values()) {
      if (b.rarity === 'mythic') bM += b.price
      else if (b.rarity === 'rare') bR += b.price
      else bU += b.price
    }
    bonusSheetEv = (bU / 20) * 0.66 + (2 * bR + bM) / (2 * 30 + 15) * 0.34
  }

  // 5. Contribution Foil moyenne par booster Draft (~1 Rare/Mythique Foil tous les 24-30 boosters)
  const avgFoilRmEv = sumFoilRM / rmSheetDenominator
  const draftFoilEv = releaseYear >= 2019 ? avgFoilRmEv * 0.045 : avgFoilRmEv * 0.03

  // EV d'un Draft Booster
  const draftPackEv = rmSlotEv + uncommonSlotEv + commonSlotEv + specialSlotEv + bonusSheetEv + draftFoilEv

  // EV d'un Play Booster (1 Rare/Mythique garantie + Wildcard ~20% RM + Foil ~7% RM + Special Guests)
  const playPackEv = rmSlotEv * 1.22 + uncommonSlotEv + commonSlotEv + specialSlotEv + bonusSheetEv + avgFoilRmEv * 0.07

  // EV d'un Set Booster (1 Rare/Mythique garantie + 2 Wildcards ~24% RM + Foil garantie + The List)
  const setPackEv = rmSlotEv * 1.24 + uncommonSlotEv * 1.1 + commonSlotEv * 0.5 + specialSlotEv + bonusSheetEv + avgFoilRmEv * 0.08

  // EV d'un Collector Booster (4 à 5 Rares/Mythiques par booster : Foil, Extended Art, Showcase/Borderless)
  let colSumRares = 0
  let colSumMythics = 0
  for (const colItem of collectorCardByName.values()) {
    const avgCardVal = (colItem.maxAltPrice + colItem.foilPrice) / 2
    if (colItem.rarity === 'mythic') colSumMythics += avgCardVal
    else if (colItem.rarity === 'rare') colSumRares += avgCardVal
  }
  const colRmEv = (2 * colSumRares + colSumMythics) / rmSheetDenominator
  const effectiveColRm = colRmEv > 0 ? colRmEv : rmSlotEv * 1.25
  // Un Collector Booster contient en moyenne 4.2 slots Rare/Mythique (ou 4 slots sur 2X2/CMM) + 2x Bonus Sheet
  const collectorPackEv = effectiveColRm * 3.4 + (uncommonSlotEv + specialSlotEv + bonusSheetEv) * 2.0

  return {
    DRAFT: Math.round(draftPackEv * 100) / 100,
    PLAY: Math.round(playPackEv * 100) / 100,
    SET: Math.round(setPackEv * 100) / 100,
    COLLECTOR: Math.round(collectorPackEv * 100) / 100
  }
}

/**
 * Synchronise les Expected Values (EV) des boîtes de boosters, bundles et boosters individuels
 * en combinant Scryfall (prix européens Cardmarket EUR), MTGJSON (composition exacte des scellés)
 * et Dawnglare (tcg_low / tcg_market).
 */
export async function syncExpectedValues(targetMonth?: string) {
  const latestAgg = await prisma.priceSnapshot.aggregate({ _max: { month: true } })
  const month =
    targetMonth && /^\d{4}-\d{2}$/.test(targetMonth)
      ? targetMonth
      : latestAgg._max.month || new Date().toISOString().slice(0, 7)
  console.log(`[EV Sync] Démarrage du calcul multi-sources des Expected Values pour ${month}...`)

  // 1. Nettoyage préalable des snapshots corrompus avec price <= 0
  await prisma.priceSnapshot.deleteMany({
    where: { price: { lte: 0 } }
  })

  // 2. Effacer les EV sur les produits vintage (< 2003) ou les decks préconstruits
  const nonEligibleProducts = await prisma.product.findMany({
    where: {
      OR: [
        { releaseDate: { lt: new Date('2003-01-01') } },
        { category: ProductCategory.PRECON_DECK }
      ]
    },
    select: { id: true }
  })
  if (nonEligibleProducts.length) {
    await prisma.priceSnapshot.updateMany({
      where: { productId: { in: nonEligibleProducts.map((p) => p.id) } },
      data: { ev: null }
    })
  }

  // 3. Chargement parallèle des métadonnées officielles : Scryfall Sets, MTGJSON SetList, et Dawnglare (tcg_low)
  const [scryfallSetsRes, mtgjsonRes, dawnglareMap] = await Promise.all([
    fetch('https://api.scryfall.com/sets', {
      headers: { 'User-Agent': 'MTG-Stats/2.0 (https://mtg-stats.aeroliths.fr)' },
      signal: AbortSignal.timeout(12000)
    })
      .then(async (r) => (r.ok ? ((await r.json()) as { data: ScryfallSet[] }) : { data: [] as ScryfallSet[] }))
      .catch((err) => {
        console.warn('[EV Sync] Impossible de charger Scryfall Sets :', err?.message || err)
        return { data: [] as ScryfallSet[] }
      }),
    fetch('https://mtgjson.com/api/v5/SetList.json', {
      signal: AbortSignal.timeout(15000)
    })
      .then(async (r) => (r.ok ? ((await r.json()) as { data: MtgjsonSet[] }) : { data: [] as MtgjsonSet[] }))
      .catch((err) => {
        console.warn('[EV Sync] Impossible de charger MTGJSON SetList :', err?.message || err)
        return { data: [] as MtgjsonSet[] }
      }),
    fetchDawnglareEvMap()
  ])

  // Indexation des sets Scryfall
  const scryfallByCode = new Map<string, ScryfallSet>()
  const scryfallByNormName = new Map<string, ScryfallSet>()
  const scryfallSortedList: { norm: string; set: ScryfallSet }[] = []

  // Priorité aux types d'extensions principales sur Scryfall
  const PRIMARY_SET_TYPES = new Set(['expansion', 'core', 'masters', 'draft_innovation', 'commander', 'funny'])

  for (const s of scryfallSetsRes.data || []) {
    if (!s.code || !s.name || s.digital) continue
    const code = s.code.toLowerCase()
    scryfallByCode.set(code, s)

    const n = normStrict(s.name)
    if (n && (PRIMARY_SET_TYPES.has(s.set_type || '') || !scryfallByNormName.has(n))) {
      scryfallByNormName.set(n, s)
      scryfallSortedList.push({ norm: n, set: s })
    }
  }
  scryfallSortedList.sort((a, b) => b.norm.length - a.norm.length)

  // Indexation de MTGJSON SetList (mapping Cardmarket mcmId -> setCode & sealedProduct)
  const mcmIdToSealed = new Map<number, { setCode: string; sp: MtgjsonSealedProduct }>()
  const sealedNameToInfo = new Map<string, { setCode: string; sp: MtgjsonSealedProduct }>()
  const baseSetSizeByCode = new Map<string, number>()

  for (const mSet of mtgjsonRes.data || []) {
    if (!mSet.code) continue
    const code = mSet.code.toLowerCase()
    if (mSet.baseSetSize && mSet.baseSetSize > 0) {
      baseSetSizeByCode.set(code, mSet.baseSetSize)
    }
    const nSet = normStrict(mSet.name || '')
    if (nSet && !scryfallByNormName.has(nSet) && scryfallByCode.has(code)) {
      scryfallByNormName.set(nSet, scryfallByCode.get(code)!)
    }

    for (const sp of mSet.sealedProduct || []) {
      if (sp.identifiers?.mcmId) {
        const mcmId = Number(sp.identifiers.mcmId)
        if (!isNaN(mcmId) && mcmId > 0) {
          mcmIdToSealed.set(mcmId, { setCode: code, sp })
        }
      }
      if (sp.name) {
        sealedNameToInfo.set(normStrict(sp.name), { setCode: code, sp })
      }
    }
  }

  // 4. Récupérer tous les produits éligibles (Boîtes, Bundles, Boosters individuels >= 2003)
  const products = await prisma.product.findMany({
    where: {
      category: { in: [ProductCategory.BOOSTER_BOX, ProductCategory.SINGLE_BOOSTER] },
      OR: [
        { releaseDate: { gte: new Date('2003-01-01') } },
        { releaseDate: null }
      ]
    },
    include: {
      prices: {
        orderBy: { month: 'desc' },
        take: 3
      }
    }
  })

  // Résolution de chaque produit vers son code d'extension officiel (setCode)
  const productResolution = new Map<
    number,
    { setCode: string; sp?: MtgjsonSealedProduct; releaseDate: Date | null }
  >()
  const neededSetCodes = new Set<string>()

  for (const p of products) {
    // Exclure les Theme Boosters, Jumpstart ou produits sans rapport avec un booster d'extension
    if (/\b(?:theme\s+booster|welcome\s+booster|sample\s+pack|land\s+station)\b/i.test(p.name)) {
      continue
    }

    let resolvedCode: string | null = null
    let resolvedSp: MtgjsonSealedProduct | undefined

    // A. Par Cardmarket ID dans MTGJSON
    if (p.cardmarketId && mcmIdToSealed.has(p.cardmarketId)) {
      const hit = mcmIdToSealed.get(p.cardmarketId)!
      if (scryfallByCode.has(hit.setCode)) {
        resolvedCode = hit.setCode
        resolvedSp = hit.sp
      }
    }

    // B. Par nom exact du produit scellé dans MTGJSON
    const rawNorm = normStrict(p.name)
    if (!resolvedCode && sealedNameToInfo.has(rawNorm)) {
      const hit = sealedNameToInfo.get(rawNorm)!
      if (scryfallByCode.has(hit.setCode)) {
        resolvedCode = hit.setCode
        resolvedSp = hit.sp
      }
    }

    // C. Par nom d'extension nettoyé (correspondance exacte avec Scryfall)
    const editionClean = extractEditionName(p.name)
    const editionNorm = normStrict(editionClean)
    if (!resolvedCode && editionNorm && scryfallByNormName.has(editionNorm)) {
      resolvedCode = scryfallByNormName.get(editionNorm)!.code.toLowerCase()
    }

    // D. Par correspondance stricte avec qualificatifs et numéros compatibles
    if (!resolvedCode && editionNorm.length >= 4) {
      for (const candidate of scryfallSortedList) {
        if (candidate.norm.length < 4) continue
        if (!hasCompatibleQualifiers(editionNorm, candidate.norm)) continue

        const wordsP = editionNorm.split(' ').filter((w) => w.length >= 2)
        const wordsS = candidate.norm.split(' ').filter((w) => w.length >= 2)
        const setP = new Set(wordsP)
        const setS = new Set(wordsS)

        const allSInP = wordsS.length >= 2 && wordsS.every((w) => setP.has(w))
        const allPInS = wordsP.length >= 2 && wordsP.every((w) => setS.has(w))
        if (allSInP || allPInS) {
          resolvedCode = candidate.set.code.toLowerCase()
          break
        }
      }
    }

    if (!resolvedCode) continue

    const sfSet = scryfallByCode.get(resolvedCode)
    const effectiveReleaseDate =
      p.releaseDate || (sfSet?.released_at ? new Date(sfSet.released_at) : null)

    // Ignorer les extensions sorties avant 2003 (format Vintage)
    if (effectiveReleaseDate && effectiveReleaseDate.getFullYear() < 2003) {
      continue
    }

    productResolution.set(p.id, {
      setCode: resolvedCode,
      sp: resolvedSp,
      releaseDate: effectiveReleaseDate
    })
    neededSetCodes.add(resolvedCode)
    if (BONUS_SHEET_BY_SET[resolvedCode]) {
      neededSetCodes.add(BONUS_SHEET_BY_SET[resolvedCode])
    }
  }

  console.log(
    `[EV Sync] ${productResolution.size}/${products.length} produits rattachés à ${neededSetCodes.size} extensions Scryfall/MTGJSON.`
  )

  // 5. Téléchargement groupé des cartes Scryfall (prix Cardmarket EUR) pour toutes les extensions requises
  const cardsBySet = await fetchScryfallCardsBySetCodes(Array.from(neededSetCodes))

  // 6. Calcul des EV par pack pour chaque extension
  const packEvBySetCode = new Map<
    string,
    { DRAFT: number; PLAY: number; SET: number; COLLECTOR: number }
  >()

  for (const code of neededSetCodes) {
    const sfSet = scryfallByCode.get(code)
    const setCards = cardsBySet.get(code) || []
    const bonusCode = BONUS_SHEET_BY_SET[code]
    const bonusCards = bonusCode ? cardsBySet.get(bonusCode) || [] : []
    const baseSize = baseSetSizeByCode.get(code) || sfSet?.card_count || 260
    const relDate = sfSet?.released_at ? new Date(sfSet.released_at) : null

    const scryfallEv = computeSetPackEvFromScryfall(code, setCards, bonusCards, baseSize, relDate)

    // Recherche d'une référence Dawnglare (tcg_low / tcg_market) pour la même extension
    let dawnglareBoxEv: number | undefined
    if (sfSet?.name) {
      const n = normStrict(extractEditionName(sfSet.name))
      dawnglareBoxEv = dawnglareMap.get(n)
    }

    const defaultDraftPacks = TWENTY_FOUR_PACK_SETS.has(code) ? 24 : 36
    const dawnglareDraftPackEv = dawnglareBoxEv ? dawnglareBoxEv / defaultDraftPacks : undefined

    if (scryfallEv && dawnglareDraftPackEv) {
      // Hybride : priorité aux prix Cardmarket EUR de Scryfall, lissé avec Dawnglare tcg_low si écart important sur vieux sets
      const ratio = scryfallEv.DRAFT / dawnglareDraftPackEv
      const blendedDraft =
        ratio >= 0.5 && ratio <= 1.8
          ? scryfallEv.DRAFT
          : scryfallEv.DRAFT * 0.6 + dawnglareDraftPackEv * 0.4

      const scale = scryfallEv.DRAFT > 0 ? blendedDraft / scryfallEv.DRAFT : 1
      packEvBySetCode.set(code, {
        DRAFT: Math.round(blendedDraft * 100) / 100,
        PLAY: Math.round(scryfallEv.PLAY * scale * 100) / 100,
        SET: Math.round(scryfallEv.SET * scale * 100) / 100,
        COLLECTOR: Math.round(scryfallEv.COLLECTOR * scale * 100) / 100
      })
    } else if (scryfallEv) {
      packEvBySetCode.set(code, scryfallEv)
    } else if (dawnglareDraftPackEv) {
      packEvBySetCode.set(code, {
        DRAFT: Math.round(dawnglareDraftPackEv * 100) / 100,
        PLAY: Math.round(dawnglareDraftPackEv * 1.22 * 100) / 100,
        SET: Math.round(dawnglareDraftPackEv * 1.20 * 100) / 100,
        COLLECTOR: Math.round(dawnglareDraftPackEv * 3.5 * 100) / 100
      })
    }
  }

  // 7. Attribution et enregistrement de l'EV propre à chaque produit (Boîte, Bundle, Booster individuel)
  // Réinitialise d'abord les anciennes EV potentiellement faussées sur le mois cible
  if (packEvBySetCode.size > 0) {
    await prisma.priceSnapshot.updateMany({
      where: { month },
      data: { ev: null }
    })
  }

  let matchedCount = 0

  for (const product of products) {
    const res = productResolution.get(product.id)
    if (!res) continue

    const packEvs = packEvBySetCode.get(res.setCode)
    if (!packEvs) continue

    const relYear = res.releaseDate ? res.releaseDate.getFullYear() : 2020
    const { packCount, effectivePackType, extraCollectorPacks } = resolvePackCount(
      product,
      res.setCode,
      relYear,
      res.releaseDate,
      res.sp
    )

    const unitPackEv = packEvs[effectivePackType] || packEvs.DRAFT
    let productEv = unitPackEv * packCount + extraCollectorPacks * packEvs.COLLECTOR
    productEv = Math.round(productEv * 100) / 100

    if (!Number.isFinite(productEv) || productEv <= 0 || productEv > 3500) continue

    // Vérification de cohérence par rapport au dernier prix connu du produit
    const latestValidSnap = product.prices.find((s) => Number(s.price) > 0)
    const currentMonthSnap = product.prices.find((s) => s.month === month)
    const refPrice = currentMonthSnap && Number(currentMonthSnap.price) > 0
      ? Number(currentMonthSnap.price)
      : latestValidSnap
        ? Number(latestValidSnap.price)
        : null

    if (!refPrice || refPrice <= 0) continue

    // Si le ratio EV / Prix sort des limites réalistes du marché scellé (15% - 220%),
    // on efface l'EV pour ne jamais afficher de valeur aberrante
    const evRatioPct = (productEv / refPrice) * 100
    if (evRatioPct < 15 || evRatioPct > 220) {
      if (currentMonthSnap && currentMonthSnap.ev != null) {
        await prisma.priceSnapshot.update({
          where: { id: currentMonthSnap.id },
          data: { ev: null }
        })
      }
      continue
    }

    if (currentMonthSnap) {
      await prisma.priceSnapshot.update({
        where: { id: currentMonthSnap.id },
        data: { ev: productEv }
      })
      matchedCount++
    } else if (latestValidSnap) {
      await prisma.priceSnapshot.create({
        data: {
          productId: product.id,
          month,
          price: latestValidSnap.price,
          ev: productEv
        }
      })
      matchedCount++
    }
  }

  console.log(`[EV Sync] Terminé : ${matchedCount} produits (boîtes, bundles, boosters) mis à jour avec leur EV pour ${month}.`)
  return { ok: true, month, matchedCount, setsAnalyzed: packEvBySetCode.size }
}
