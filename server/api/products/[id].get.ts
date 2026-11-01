function normalizeBaseSetName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(?:draft|set|play|collector|jumpstart|theme|value|omega|beyond)?\s*(?:booster\s*(?:box|display|pack|packs)?|display|box|bundle|fat\s*pack|pack|boîte|boite)\b/gi, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

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
  const isBundle = product.type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(product.name)

  const latestEvSnap = [...product.prices].reverse().find((s) => s.ev != null && Number(s.ev) > 0)
  let lastValidEv: number | null = latestEvSnap?.ev != null ? Number(latestEvSnap.ev) : null

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

  // Recherche du produit miroir (Booster à l'unité <-> Boîte de boosters) pour le comparateur de rentabilité
  let unitComparison: {
    id: number
    name: string
    category: string
    type: string
    price: number
  } | null = null

  if (cat === 'BOOSTER_BOX' || cat === 'SINGLE_BOOSTER') {
    const targetCategory = cat === 'BOOSTER_BOX' ? 'SINGLE_BOOSTER' : 'BOOSTER_BOX'
    const targetType = isBundle ? 'PLAY' : product.type
    const baseName = normalizeBaseSetName(product.name)

    if (baseName.length >= 3) {
      const candidates = await prisma.product.findMany({
        where: {
          category: targetCategory as any,
          id: { not: product.id }
        },
        include: {
          prices: { orderBy: { month: 'desc' }, take: 1 }
        }
      })

      const matched = candidates
        .filter((c) => {
          const cIsBundle = c.type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(c.name)
          if (targetCategory === 'BOOSTER_BOX' && cIsBundle) return false
          return normalizeBaseSetName(c.name) === baseName
        })
        .sort((a, b) => {
          const aExactType = a.type === targetType ? 1 : 0
          const bExactType = b.type === targetType ? 1 : 0
          return bExactType - aExactType
        })[0]

      const latestPrice = matched?.prices?.[0]?.price != null ? Number(matched.prices[0].price) : null
      if (matched && latestPrice && latestPrice > 0) {
        unitComparison = {
          id: matched.id,
          name: matched.name,
          category: (matched as any).category || targetCategory,
          type: matched.type,
          price: latestPrice
        }
      }
    }
  }

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
    unitComparison,
    history
  }
})
