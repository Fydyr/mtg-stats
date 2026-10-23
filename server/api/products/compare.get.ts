import { cardmarketLink } from '../../utils/months'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rawIds = String(query.ids || '')
  const idList = rawIds
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0)
    .slice(0, 5) // Maximum 5 boîtes à comparer

  if (!idList.length) {
    return { products: [] }
  }

  const products = await prisma.product.findMany({
    where: { id: { in: idList } },
    include: { prices: { orderBy: { month: 'asc' } } }
  })

  return {
    products: products.map((p) => {
      const validPrices = p.prices.filter((s) => Number(s.price) > 0)
      const current = validPrices.length ? Number(validPrices[validPrices.length - 1].price) : null
      const first = validPrices.length ? Number(validPrices[0].price) : null
      const prev = validPrices.length > 1 ? Number(validPrices[validPrices.length - 2].price) : null
      const var1m = current && prev ? Math.round(((current - prev) / prev) * 1000) / 10 : null
      const varTotal = current && first ? Math.round(((current - first) / first) * 1000) / 10 : null

      const lastSnap = validPrices.length ? validPrices[validPrices.length - 1] : null
      const lastEv = lastSnap?.ev != null && Number(lastSnap.ev) > 0 ? Number(lastSnap.ev) : null
      const evRatio = lastEv && current ? Math.round((lastEv / current) * 100) : null

      return {
        id: p.id,
        name: p.name,
        category: (p as any).category || 'BOOSTER_BOX',
        type: p.type,
        deckType: (p as any).deckType || null,
        releaseDate: p.releaseDate,
        standardLegalUntil: p.standardLegalUntil ? p.standardLegalUntil.toISOString().slice(0, 10) : null,
        stock: p.stock ?? null,
        imageUrl: p.imageUrl || null,
        cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, (p as any).category),
        currentPrice: current,
        firstPrice: first,
        var1m,
        varTotal,
        lastEv,
        evRatio,
        history: p.prices.map((s) => ({
          month: s.month,
          price: Number(s.price),
          ev: s.ev != null ? Number(s.ev) : null
        }))
      }
    })
  }
})
