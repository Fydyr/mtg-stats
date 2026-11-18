import { MONTH_RE, shiftMonth } from '../../utils/months'

/** Produits avec le prix du mois demandé, celui du mois précédent le plus récent et l'historique complet des mois précédents. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const { month } = getQuery(event) as { month?: string }
  if (!month || !MONTH_RE.test(month)) {
    throw createError({ statusCode: 400, statusMessage: 'Mois invalide (YYYY-MM attendu)' })
  }

  const defaultPrevMonth = shiftMonth(month, -1)

  const products = await prisma.product.findMany({
    orderBy: [{ releaseDate: 'desc' }, { name: 'asc' }],
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
    const rawPrice = currentSnap ? Number(currentSnap.price) : NaN
    const price = Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : NaN
    const previousMonths = p.prices
      .filter((s) => s.month < month)
      .map((s) => ({
        month: s.month,
        price: Number(s.price),
        ev: s.ev != null && Number(s.ev) > 0 ? Number(s.ev) : null
      }))

    return {
      id: p.id,
      name: p.name,
      category: (p as any).category || 'BOOSTER_BOX',
      type: p.type,
      deckType: (p as any).deckType || null,
      releaseDate: p.releaseDate ? p.releaseDate.toISOString().slice(0, 10) : null,
      standardLegalUntil: p.standardLegalUntil ? p.standardLegalUntil.toISOString().slice(0, 10) : '',
      stock: p.stock ?? null,
      cardmarketUrl: p.cardmarketUrl ?? '',
      price,
      ev: currentSnap?.ev != null && Number(currentSnap.ev) > 0 ? Number(currentSnap.ev) : null,
      previous: Number(prevSnap?.price ?? NaN),
      previousMonth: prevSnap?.month ?? defaultPrevMonth,
      previousMonths
    }
  })
})
