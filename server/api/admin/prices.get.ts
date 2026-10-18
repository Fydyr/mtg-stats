import { MONTH_RE, shiftMonth } from '../../utils/months'

/** Produits avec le prix du mois demandé et celui du mois précédent (pour aider à la saisie). */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const { month } = getQuery(event) as { month?: string }
  if (!month || !MONTH_RE.test(month)) {
    throw createError({ statusCode: 400, statusMessage: 'Mois invalide (YYYY-MM attendu)' })
  }
  const prev = shiftMonth(month, -1)

  const products = await prisma.product.findMany({
    orderBy: [{ releaseDate: 'asc' }, { name: 'asc' }],
    include: { prices: { where: { month: { in: [month, prev] } } } }
  })

  return products.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.type,
    cardmarketUrl: p.cardmarketUrl ?? '',
    price: Number(p.prices.find((s) => s.month === month)?.price ?? NaN),
    previous: Number(p.prices.find((s) => s.month === prev)?.price ?? NaN)
  }))
})
