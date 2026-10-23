import { cardmarketLink, shiftMonth, variation } from '../../utils/months'

export default defineEventHandler(async () => {
  const [products, latest] = await Promise.all([
    prisma.product.findMany({
      include: { prices: { orderBy: { month: 'desc' } } },
      orderBy: { releaseDate: 'asc' }
    }),
    prisma.priceSnapshot.aggregate({ _max: { month: true } })
  ])

  const month = latest._max.month
  if (!month) return { month: null, items: [] }

  const m3 = shiftMonth(month, -3)
  const m6 = shiftMonth(month, -6)

  const items = products.map((p) => {
    const byMonth = new Map(p.prices.map((s) => [s.month, Number(s.price)]))
    const current = byMonth.get(month) ?? null

    // Le relevé précédent le plus récent avant le mois en cours
    const prevSnap = p.prices.find((s) => s.month < month && Number(s.price) > 0)
    const previous = prevSnap ? Number(prevSnap.price) : null

    // Prix 3 mois et 6 mois (ou les plus proches)
    const p3 = byMonth.get(m3) ?? p.prices.find((s) => s.month <= m3)?.price ?? null
    const p6 = byMonth.get(m6) ?? p.prices.find((s) => s.month <= m6)?.price ?? null

    const currentSnap = p.prices.find((s) => s.month === month)
    const currentEv = currentSnap?.ev != null ? Number(currentSnap.ev) : null

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
      previous,
      var1m: variation(current, previous),
      var3m: variation(current, p3 ? Number(p3) : null),
      var6m: variation(current, p6 ? Number(p6) : null)
    }
  })

  return { month, items }
})
