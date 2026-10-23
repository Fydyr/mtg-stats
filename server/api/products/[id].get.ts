export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

  const product = await prisma.product.findUnique({
    where: { id },
    include: { prices: { orderBy: { month: 'asc' } } }
  })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })

  return {
    id: product.id,
    name: product.name,
    category: (product as any).category || 'BOOSTER_BOX',
    type: product.type,
    deckType: (product as any).deckType || null,
    releaseDate: product.releaseDate,
    cardmarket: cardmarketLink(product.name, product.type, product.cardmarketUrl, (product as any).category),
    history: product.prices.map((s) => ({
      month: s.month,
      price: Number(s.price),
      ev: s.ev != null ? Number(s.ev) : null
    }))
  }
})
