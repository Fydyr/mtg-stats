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
      type: p.type,
      releaseDate: p.releaseDate,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl),
      history: p.prices.map((s) => ({
        month: s.month,
        price: Number(s.price),
        ev: s.ev != null ? Number(s.ev) : null
      }))
    }))
  }
})
