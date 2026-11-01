function normalizeBaseSetName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b(?:commander\s*deck|challenger\s*deck|starter\s*kit|brawl\s*deck|theme\s*deck|intro\s*pack)\b/gi, ' ')
    .replace(/\b(?:draft|set|play|collector|jumpstart|theme|value|omega|beyond|gift)?\s*(?:booster\s*(?:box|display|pack|packs)?|display|box|bundle|fat\s*pack|pack|boîte|boite)\b/gi, ' ')
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

  // Recherche du produit miroir (Booster à l'unité <-> Boîte de boosters) et de toutes les déclinaisons de la même extension
  let unitComparison: {
    id: number
    name: string
    category: string
    type: string
    price: number
  } | null = null

  const relatedProducts: {
    id: number
    name: string
    category: string
    type: string
    deckType: string | null
    imageUrl: string | null
    price: number | null
    var1m: number | null
  }[] = []

  const baseName = normalizeBaseSetName(product.name)
  if (baseName.length >= 3 && !/\bsecret\s+lair\b/i.test(product.name)) {
    const allOthers = await prisma.product.findMany({
      where: { id: { not: product.id } },
      include: { prices: { orderBy: { month: 'desc' }, take: 2 } }
    })

    const sameSetItems = allOthers.filter((c) => {
      const cBase = normalizeBaseSetName(c.name)
      if (!cBase) return false
      return (
        cBase === baseName ||
        (baseName.length >= 6 && cBase.startsWith(baseName + ' ')) ||
        (cBase.length >= 6 && baseName.startsWith(cBase + ' '))
      )
    })

    for (const item of sameSetItems) {
      const latest = item.prices[0]?.price != null ? Number(item.prices[0].price) : null
      const prev = item.prices[1]?.price != null ? Number(item.prices[1].price) : null
      let var1m: number | null = null
      if (latest && latest > 0 && prev && prev > 0) {
        const diff = Math.round(((latest - prev) / prev) * 1000) / 10
        if (diff > -95) var1m = diff
      }

      relatedProducts.push({
        id: item.id,
        name: item.name,
        category: (item as any).category || 'BOOSTER_BOX',
        type: item.type,
        deckType: (item as any).deckType || null,
        imageUrl: item.imageUrl || null,
        price: latest && latest > 0 ? latest : null,
        var1m
      })
    }

    // Tri par catégorie (Boîtes d'abord, puis Boosters, puis Decks) et par prix décroissant
    const catOrder: Record<string, number> = { BOOSTER_BOX: 1, SINGLE_BOOSTER: 2, PRECON_DECK: 3 }
    relatedProducts.sort((a, b) => {
      const cDiff = (catOrder[a.category] || 9) - (catOrder[b.category] || 9)
      if (cDiff !== 0) return cDiff
      return (b.price || 0) - (a.price || 0)
    })

    if (cat === 'BOOSTER_BOX' || cat === 'SINGLE_BOOSTER') {
      const targetCategory = cat === 'BOOSTER_BOX' ? 'SINGLE_BOOSTER' : 'BOOSTER_BOX'
      const targetType = isBundle ? 'PLAY' : product.type

      const matched = relatedProducts
        .filter((c) => {
          if (c.category !== targetCategory || !c.price || c.price <= 0) return false
          const cIsBundle = c.type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(c.name)
          if (targetCategory === 'BOOSTER_BOX' && cIsBundle) return false
          return normalizeBaseSetName(c.name) === baseName
        })
        .sort((a, b) => (b.type === targetType ? 1 : 0) - (a.type === targetType ? 1 : 0))[0]

      if (matched && matched.price) {
        unitComparison = {
          id: matched.id,
          name: matched.name,
          category: matched.category,
          type: matched.type,
          price: matched.price
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
    relatedProducts: relatedProducts.slice(0, 12),
    history
  }
})
