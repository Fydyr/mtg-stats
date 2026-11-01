import { shiftMonth, variation, cardmarketLink } from '../../utils/months'
import { getDynamicStandardCache, resolveProductStandardLegalUntil } from '../../utils/standard-legal'

export default defineEventHandler(async () => {
  const [products, latest, stdCache] = await Promise.all([
    prisma.product.findMany({
      include: { prices: { orderBy: { month: 'desc' } } },
      orderBy: [{ releaseDate: 'desc' }, { name: 'asc' }]
    }),
    prisma.priceSnapshot.aggregate({ _max: { month: true } }),
    getDynamicStandardCache()
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

  // 4. Chronologie de Rotation Standard (résolue dynamiquement via Scryfall / What's in Standard)
  const now = new Date()
  const currentYear = now.getFullYear()

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
      label: 'Prochaine vague de rotation (Eldraine → Duskmourn)',
      sub: 'Extensions sorties en 2023–2024 qui quitteront le Standard début 2027 : transition fréquente vers une prime de rareté scellée.',
      horizon: 'Début 2027',
      items: []
    },
    {
      key: 'ACTIVE_STANDARD',
      label: 'Standard Cœur (Sorties 2025–2026)',
      sub: 'Extensions récentes au cœur du métagame compétitif, légales jusqu’en 2028–2029.',
      horizon: '2028 – 2029',
      items: []
    },
    {
      key: 'LONG_TERM',
      label: 'Piliers Long Terme (Foundations & 2029+)',
      sub: 'Extensions à légalité prolongée conçues pour rester la base du format jusqu’en 2029 minimum.',
      horizon: '2029+',
      items: []
    }
  ]

  const seenSetType = new Set<string>()
  for (const item of items) {
    if (item.type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(item.name)) continue

    const legalUntilDate = resolveProductStandardLegalUntil(item, stdCache, now)
    if (!legalUntilDate || legalUntilDate < now) continue

    const relDate = item.releaseDate ? new Date(item.releaseDate) : null
    const relYear = relDate ? relDate.getFullYear() : currentYear

    const dedupKey = `${item.name.toLowerCase()}|${item.type}`
    if (seenSetType.has(dedupKey)) continue
    seenSetType.add(dedupKey)

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

    if (legalUntilDate.getFullYear() >= 2029 && (/\b(?:foundations|fondations)\b/i.test(item.name) || item.standardLegalUntil)) {
      rotationGroups[2].items.push(entry)
    } else if (relYear <= 2024) {
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
