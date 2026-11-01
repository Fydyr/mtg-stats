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
    products: products.map((p) => {
      const cat = (p as any).category || 'BOOSTER_BOX'
      const isVintage = p.releaseDate ? new Date(p.releaseDate).getFullYear() < 2003 : false
      const validPrices = p.prices.filter((s) => Number(s.price) > 0)
      const current = validPrices.length ? Number(validPrices[validPrices.length - 1].price) : null
      const first = validPrices.length ? Number(validPrices[0].price) : null
      const prev = validPrices.length > 1 ? Number(validPrices[validPrices.length - 2].price) : null
      const var1m = current && prev ? Math.round(((current - prev) / prev) * 1000) / 10 : null
      const varTotal = current && first ? Math.round(((current - first) / first) * 1000) / 10 : null

      const lastSnapWithEv = [...validPrices].reverse().find((s) => s.ev != null && Number(s.ev) > 0)
      const rawEv = (!isVintage && cat !== 'PRECON_DECK' && lastSnapWithEv?.ev != null)
        ? Number(lastSnapWithEv.ev)
        : null
      const rawRatio = rawEv && current && current > 0 ? Math.round((rawEv / current) * 100) : null
      const isValidEv = rawRatio != null && rawRatio >= 15 && rawRatio <= 220
      const lastEv = isValidEv ? rawEv : null
      const evRatio = isValidEv ? rawRatio : null

      return {
        id: p.id,
        name: p.name,
        category: cat,
        type: p.type,
        deckType: (p as any).deckType || null,
        releaseDate: p.releaseDate,
        standardLegalUntil: p.standardLegalUntil ? p.standardLegalUntil.toISOString().slice(0, 10) : null,
        stock: p.stock ?? null,
        imageUrl: p.imageUrl || null,
        cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, cat),
        currentPrice: current,
        firstPrice: first,
        var1m,
        varTotal,
        lastEv,
        evRatio,
        history: p.prices.map((s) => {
          const pr = Number(s.price)
          const ev = (!isVintage && cat !== 'PRECON_DECK' && s.ev != null && Number(s.ev) > 0) ? Number(s.ev) : null
          const r = ev && pr > 0 ? Math.round((ev / pr) * 100) : null
          return {
            month: s.month,
            price: pr,
            ev: r != null && r >= 15 && r <= 220 ? ev : null
          }
        })
      }
    })
  }
})
