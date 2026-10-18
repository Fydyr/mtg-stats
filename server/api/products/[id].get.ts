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
    type: product.type,
    releaseDate: product.releaseDate,
    cardmarket: cardmarketLink(product.name, product.type, product.cardmarketUrl),
    history: product.prices.map((s) => ({
      month: s.month,
      price: Number(s.price),
      ev: s.ev != null ? Number(s.ev) : null
    }))
  }
})
