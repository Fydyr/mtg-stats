import { shiftMonth, variation, cardmarketLink } from '../../utils/months'

export default defineEventHandler(async () => {
  const [products, latest] = await Promise.all([
    prisma.product.findMany({
      include: { prices: { orderBy: { month: 'desc' } } },
      orderBy: { releaseDate: 'asc' }
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
    const currentEv = currentSnap?.ev != null ? Number(currentSnap.ev) : null

    const var1m = variation(current, previous)
    const var3m = variation(current, p3 ? Number(p3) : null)
    const var6m = variation(current, p6 ? Number(p6) : null)
    const evRatio = (currentEv != null && current != null && current > 0)
      ? Math.round((currentEv / current) * 100)
      : null

    return {
      id: p.id,
      name: p.name,
      category: (p as any).category || 'BOOSTER_BOX',
      type: p.type,
      deckType: (p as any).deckType || null,
      releaseDate: p.releaseDate,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, (p as any).category),
      price: current,
      ev: currentEv,
      evRatio,
      var1m,
      var3m,
      var6m
    }
  }).filter((i) => i.price != null && i.price > 0)

  // 1. Tendances globales
  const withVar1m = items.filter((i) => i.var1m != null)
  const withVar3m = items.filter((i) => i.var3m != null)
  const withVar6m = items.filter((i) => i.var6m != null)

  const avgPrice = Math.round(items.reduce((acc, i) => acc + i.price!, 0) / items.length)
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
    topEv
  }
})
