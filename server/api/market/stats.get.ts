import { shiftMonth, variation, cardmarketLink } from '../../utils/months'

export default defineEventHandler(async () => {
  const [products, latest] = await Promise.all([
    prisma.product.findMany({
      include: { prices: { orderBy: { month: 'desc' } } },
      orderBy: [{ releaseDate: 'desc' }, { name: 'asc' }]
    }),
    prisma.priceSnapshot.aggregate({ _max: { month: true } })
  ])

  const month = latest._max.month
  if (!month) {
    return {
      month: null,
      marketTrend: null,
      byType: [],
      topGainers: [],
      topLosers: [],
      topEv: []
    }
  }

  const m3 = shiftMonth(month, -3)
  const m6 = shiftMonth(month, -6)

  const items = products.map((p) => {
    const byMonth = new Map(p.prices.map((s) => [s.month, Number(s.price)]))
    const current = byMonth.get(month) ?? null

    const prevSnap = p.prices.find((s) => s.month < month && Number(s.price) > 0)
    const previous = prevSnap ? Number(prevSnap.price) : null

    const p3 = byMonth.get(m3) ?? p.prices.find((s) => s.month <= m3)?.price ?? null
    const p6 = byMonth.get(m6) ?? p.prices.find((s) => s.month <= m6)?.price ?? null

    const currentSnap = p.prices.find((s) => s.month === month)
    const fallbackEvSnap = p.prices.find((s) => s.ev != null && Number(s.ev) > 0)
    const rawEv = currentSnap?.ev != null && Number(currentSnap.ev) > 0
      ? Number(currentSnap.ev)
      : fallbackEvSnap?.ev != null
        ? Number(fallbackEvSnap.ev)
        : null

    const isVintage = p.releaseDate ? new Date(p.releaseDate).getFullYear() < 2003 : false
    const cat = (p as any).category || 'BOOSTER_BOX'
    const isBox = cat === 'BOOSTER_BOX'

    const rawEvRatio = (rawEv != null && rawEv > 0 && isBox && !isVintage && rawEv < 3500 && current != null && current > 0)
      ? Math.round((rawEv / current) * 100)
      : null
    const isValidEv = rawEvRatio != null && rawEvRatio >= 15 && rawEvRatio <= 220
    const currentEv = isValidEv ? rawEv : null
    const evRatio = isValidEv ? rawEvRatio : null

    const var1m = variation(current, previous)
    const var3m = variation(current, p3 ? Number(p3) : null)
    const var6m = variation(current, p6 ? Number(p6) : null)

    return {
      id: p.id,
      name: p.name,
      category: cat,
      type: p.type,
      deckType: (p as any).deckType || null,
      releaseDate: p.releaseDate,
      standardLegalUntil: p.standardLegalUntil ? p.standardLegalUntil.toISOString().slice(0, 10) : null,
      imageUrl: p.imageUrl || null,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, cat),
      price: current,
      ev: currentEv,
      evRatio,
      var1m,
      var3m,
      var6m
    }
  }).filter((i) => i.category === 'BOOSTER_BOX' && i.price != null && i.price > 0 && (i.var1m == null || i.var1m > -95))

  // 1. Tendances globales
  const withVar1m = items.filter((i) => i.var1m != null)
  const withVar3m = items.filter((i) => i.var3m != null)
  const withVar6m = items.filter((i) => i.var6m != null)

  const avgPrice = items.length ? Math.round(items.reduce((acc, i) => acc + i.price!, 0) / items.length) : 0
  const avgVar1m = withVar1m.length ? withVar1m.reduce((acc, i) => acc + i.var1m!, 0) / withVar1m.length : 0
  const avgVar3m = withVar3m.length ? withVar3m.reduce((acc, i) => acc + i.var3m!, 0) / withVar3m.length : 0
  const avgVar6m = withVar6m.length ? withVar6m.reduce((acc, i) => acc + i.var6m!, 0) / withVar6m.length : 0

  // 2. Performances par type
  const types = ['DRAFT', 'SET', 'PLAY', 'COLLECTOR']
  const byType = types.map((t) => {
    const list = items.filter((i) => i.type === t)
    const tVar1m = list.filter((i) => i.var1m != null)
    const tVar3m = list.filter((i) => i.var3m != null)
    const tAvgPrice = list.length ? Math.round(list.reduce((acc, i) => acc + i.price!, 0) / list.length) : null
    const tAvgVar1m = tVar1m.length ? tVar1m.reduce((acc, i) => acc + i.var1m!, 0) / tVar1m.length : null
    const tAvgVar3m = tVar3m.length ? tVar3m.reduce((acc, i) => acc + i.var3m!, 0) / tVar3m.length : null
    return {
      type: t,
      count: list.length,
      avgPrice: tAvgPrice,
      avgVar1m: tAvgVar1m,
      avgVar3m: tAvgVar3m
    }
  })

  // 3. Palmarès
  const topGainers = [...withVar1m].sort((a, b) => b.var1m! - a.var1m!).slice(0, 10)
  const topLosers = [...withVar1m].sort((a, b) => a.var1m! - b.var1m!).slice(0, 10)
  const topEv = [...items.filter((i) => i.evRatio != null)].sort((a, b) => b.evRatio! - a.evRatio!).slice(0, 10)

  // 4. Chronologie de Rotation Standard
  const now = new Date()
  const currentYear = now.getFullYear()
  const cutoffYear = currentYear - 3

  // Liste stricte des extensions non-Standard (formats Éternels, Modern, Commander, Draft suppl., Universes Beyond hors Standard)
  const nonStandardRegex = /\b(?:mystery|cluedo|clue\s+edition|masters|horizons|remastered|commander|jumpstart|secret\s+lair|unfinity|unsanctioned|unstable|unhinged|unglued|universes\s+beyond|fallout|warhammer|doctor\s+who|assassin|lord\s+of\s+the\s+rings|tales\s+of\s+middle|jurassic|transformers|modern\s+event|conspiracy|battlebond|planechase|archenemy|game\s+night|explorers\s+of\s+ixalan|anthology|from\s+the\s+vault|spellbook|starter|challenger|theme\s+booster|value\s+booster|collector'?s\s+edition|world\s+championship|chronicles|renaissance|time\s+spiral)\b/i

  // Liste des extensions Premier officiellement légales en Standard (2022-2026+)
  const standardPremierRegex = /\b(?:kamigawa|new\s+capenna|dominaria\s+united|brothers'?\s+war|phyrexia|all\s+will\s+be\s+one|march\s+of\s+the\s+machine|wilds\s+of\s+eldraine|lost\s+caverns\s+of\s+ixalan|karlov\s+manor|thunder\s+junction|bloomburrow|duskmourn|foundations|aetherdrift|tarkir|dragonstorm|edge\s+of\s+eternities|final\s+fantasy|spider-?man|avatar|lorwyn\s+eclipsed|secrets\s+of\s+strixhaven|reality\s+fracture)\b/i

  const rotationGroups: {
    key: 'ROTATING_SOON' | 'ACTIVE_STANDARD' | 'LONG_TERM'
    label: string
    sub: string
    horizon: string
    items: {
      id: number
      name: string
      type: string
      releaseDate: string | null
      legalUntil: string
      price: number
      var1m: number | null
      evRatio: number | null
    }[]
  }[] = [
    {
      key: 'ROTATING_SOON',
      label: 'Rotation imminente (< 12 mois)',
      sub: 'Extensions en dernière année de Standard : transition fréquente vers une prime de rareté scellée.',
      horizon: `${currentYear + 1}`,
      items: []
    },
    {
      key: 'ACTIVE_STANDARD',
      label: 'Standard Cœur (1 à 2 ans restants)',
      sub: 'Extensions actuellement au cœur du métagame compétitif et fortement ouvertes.',
      horizon: `${currentYear + 2} – ${currentYear + 3}`,
      items: []
    },
    {
      key: 'LONG_TERM',
      label: 'Piliers Long Terme (Foundations & 2029+)',
      sub: 'Extensions à légalité prolongée conçues pour rester la base du format.',
      horizon: '2029+',
      items: []
    }
  ]

  const seenSetType = new Set<string>()
  for (const item of items) {
    if (!item.releaseDate && !item.standardLegalUntil) continue
    if (nonStandardRegex.test(item.name)) continue
    if (!item.standardLegalUntil && !standardPremierRegex.test(item.name)) continue
    if (item.type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(item.name)) continue

    const relDate = item.releaseDate ? new Date(item.releaseDate) : null
    const relYear = relDate ? relDate.getFullYear() : currentYear

    let legalUntilDate: Date
    if (item.standardLegalUntil) {
      legalUntilDate = new Date(item.standardLegalUntil)
    } else if (/\bfoundations\b/i.test(item.name)) {
      legalUntilDate = new Date('2029-12-31')
    } else {
      legalUntilDate = new Date(relYear + 3, 8, 1)
    }

    if (legalUntilDate < now || (!item.standardLegalUntil && relYear < cutoffYear)) continue

    const dedupKey = `${item.name.toLowerCase()}|${item.type}`
    if (seenSetType.has(dedupKey)) continue
    seenSetType.add(dedupKey)

    const monthsLeft = (legalUntilDate.getFullYear() - now.getFullYear()) * 12 + (legalUntilDate.getMonth() - now.getMonth())
    const entry = {
      id: item.id,
      name: item.name,
      type: item.type,
      releaseDate: item.releaseDate ? new Date(item.releaseDate).toISOString().slice(0, 10) : null,
      legalUntil: legalUntilDate.toISOString().slice(0, 10),
      price: item.price!,
      var1m: item.var1m,
      evRatio: item.evRatio
    }

    if (legalUntilDate.getFullYear() >= 2029 || /\bfoundations\b/i.test(item.name)) {
      rotationGroups[2].items.push(entry)
    } else if (monthsLeft <= 14 || relYear <= cutoffYear + 1) {
      rotationGroups[0].items.push(entry)
    } else {
      rotationGroups[1].items.push(entry)
    }
  }

  for (const g of rotationGroups) {
    g.items = g.items.slice(0, 8)
  }

  return {
    month,
    marketTrend: {
      totalProducts: items.length,
      avgPrice,
      avgVar1m,
      avgVar3m,
      avgVar6m
    },
    byType,
    topGainers,
    topLosers,
    topEv,
    rotationTimeline: rotationGroups.filter((g) => g.items.length > 0)
  }
})
