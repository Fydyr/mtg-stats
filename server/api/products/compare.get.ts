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
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      category: (p as any).category || 'BOOSTER_BOX',
      type: p.type,
      deckType: (p as any).deckType || null,
      releaseDate: p.releaseDate,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, (p as any).category),
      history: p.prices.map((s) => ({
        month: s.month,
        price: Number(s.price),
        ev: s.ev != null ? Number(s.ev) : null
      }))
    }))
  }
})
