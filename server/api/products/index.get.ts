import { cardmarketLink, shiftMonth, variation } from '../../utils/months'

export default defineEventHandler(async () => {
  const [products, latest] = await Promise.all([
    prisma.product.findMany({ include: { prices: true }, orderBy: { releaseDate: 'asc' } }),
    prisma.priceSnapshot.aggregate({ _max: { month: true } })
  ])

  const month = latest._max.month
  if (!month) return { month: null, items: [] }

  const m1 = shiftMonth(month, -1)
  const m3 = shiftMonth(month, -3)
  const m6 = shiftMonth(month, -6)

  const items = products.map((p) => {
    const byMonth = new Map(p.prices.map((s) => [s.month, Number(s.price)]))
    const current = byMonth.get(month) ?? null
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      releaseDate: p.releaseDate,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl),
      price: current,
      previous: byMonth.get(m1) ?? null,
      var1m: variation(current, byMonth.get(m1) ?? null),
      var3m: variation(current, byMonth.get(m3) ?? null),
      var6m: variation(current, byMonth.get(m6) ?? null)
    }
  })

  return { month, items }
})
