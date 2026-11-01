export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

  const product = await prisma.product.findUnique({
    where: { id },
    include: { prices: { orderBy: { month: 'asc' } } }
  })
  if (!product) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable' })

  const isVintage = product.releaseDate ? new Date(product.releaseDate).getFullYear() < 2003 : false
  const cat = (product as any).category || 'BOOSTER_BOX'

  let lastValidEv: number | null = null

  const history = product.prices.map((s) => {
    const price = Number(s.price)
    const rawEv = s.ev != null && Number(s.ev) > 0 ? Number(s.ev) : null
    let validEv: number | null = null

    if (!isVintage && cat !== 'PRECON_DECK' && price > 0) {
      const candidateEv = rawEv ?? lastValidEv
      if (candidateEv != null && candidateEv > 0 && candidateEv < 3500) {
        const ratio = Math.round((candidateEv / price) * 100)
        if (ratio >= 15 && ratio <= 220) {
          validEv = candidateEv
          if (rawEv != null) lastValidEv = rawEv
        }
      }
    }

    return {
      month: s.month,
      price,
      ev: validEv
    }
  })

  return {
    id: product.id,
    name: product.name,
    category: cat,
    type: product.type,
    deckType: (product as any).deckType || null,
    releaseDate: product.releaseDate,
    standardLegalUntil: product.standardLegalUntil ? product.standardLegalUntil.toISOString().slice(0, 10) : null,
    stock: product.stock ?? null,
    cardmarket: cardmarketLink(product.name, product.type, product.cardmarketUrl, cat),
    imageUrl: product.imageUrl || null,
    history
  }
})
