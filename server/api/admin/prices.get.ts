import { MONTH_RE } from '../../utils/months'

/** Produits avec le prix du mois demandé et celui du mois précédent le plus récent (pour aider à la saisie). */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const { month } = getQuery(event) as { month?: string }
  if (!month || !MONTH_RE.test(month)) {
    throw createError({ statusCode: 400, statusMessage: 'Mois invalide (YYYY-MM attendu)' })
  }

  const products = await prisma.product.findMany({
    orderBy: [{ releaseDate: 'asc' }, { name: 'asc' }],
    include: {
      prices: {
        where: { month: { lte: month } },
        orderBy: { month: 'desc' }
      }
    }
  })

  return products.map((p) => {
    const currentSnap = p.prices.find((s) => s.month === month)
    const prevSnap = p.prices.find((s) => s.month < month && Number(s.price) > 0)
    return {
      id: p.id,
      name: p.name,
      type: p.type,
      releaseDate: p.releaseDate ? p.releaseDate.toISOString().slice(0, 10) : null,
      cardmarketUrl: p.cardmarketUrl ?? '',
      price: Number(currentSnap?.price ?? NaN),
      previous: Number(prevSnap?.price ?? NaN)
    }
  })
})
