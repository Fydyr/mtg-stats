import { cardmarketLink, shiftMonth, variation } from '../../utils/months'
import { syncProductReleaseDates } from '../../utils/sync-release-dates'

let hasCheckedReleaseDates = false

export default defineEventHandler(async () => {
  // Déclenche une synchronisation des dates de sortie si des boosters/decks n'en ont pas
  if (!hasCheckedReleaseDates) {
    hasCheckedReleaseDates = true
    const countMissing = await prisma.product.count({
      where: {
        category: { in: ['SINGLE_BOOSTER', 'PRECON_DECK'] },
        releaseDate: null
      }
    })
    if (countMissing > 0) {
      await syncProductReleaseDates().catch((err) =>
        console.warn('[ReleaseDates] Erreur de synchronisation automatique :', err?.message || err)
      )
    }
  }

  const [products, latest] = await Promise.all([
    prisma.product.findMany({
      include: { prices: { orderBy: { month: 'desc' } } }
    }),
    prisma.priceSnapshot.aggregate({ _max: { month: true } })
  ])

  const month = latest._max.month
  if (!month) return { month: null, items: [] }

  const m3 = shiftMonth(month, -3)
  const m6 = shiftMonth(month, -6)

  const items = products.map((p) => {
    const byMonth = new Map(p.prices.map((s) => [s.month, Number(s.price)]))
    const rawCurrent = byMonth.get(month) ?? null
    // Un prix <= 0 est une absence de données ou un bug d'import
    const current = (rawCurrent != null && rawCurrent > 0) ? rawCurrent : null

    // Le relevé précédent le plus récent avant le mois en cours
    const prevSnap = p.prices.find((s) => s.month < month && Number(s.price) > 0)
    const previous = prevSnap ? Number(prevSnap.price) : null

    // Prix 3 mois et 6 mois (ou les plus proches)
    const rawP3 = byMonth.get(m3) ?? p.prices.find((s) => s.month <= m3 && Number(s.price) > 0)?.price ?? null
    const p3 = (rawP3 != null && Number(rawP3) > 0) ? Number(rawP3) : null
    const rawP6 = byMonth.get(m6) ?? p.prices.find((s) => s.month <= m6 && Number(s.price) > 0)?.price ?? null
    const p6 = (rawP6 != null && Number(rawP6) > 0) ? Number(rawP6) : null

    const currentSnap = p.prices.find((s) => s.month === month)
    const rawEv = currentSnap?.ev != null ? Number(currentSnap.ev) : null
    
    // L'EV ne s'applique qu'aux boîtes de boosters modernes (pas aux boosters unitaires, decks ou reliques vintage)
    const isVintage = p.releaseDate ? new Date(p.releaseDate).getFullYear() < 2003 : false
    const isBox = ((p as any).category || 'BOOSTER_BOX') === 'BOOSTER_BOX' && (p.type === 'DRAFT' || p.type === 'PLAY' || p.type === 'SET')
    const currentEv = (rawEv != null && rawEv > 0 && isBox && !isVintage && rawEv < 3000) ? rawEv : null

    return {
      id: p.id,
      name: p.name,
      category: (p as any).category || 'BOOSTER_BOX',
      type: p.type,
      deckType: (p as any).deckType || null,
      releaseDate: p.releaseDate,
      standardLegalUntil: p.standardLegalUntil ? p.standardLegalUntil.toISOString().slice(0, 10) : null,
      stock: p.stock ?? null,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, (p as any).category),
      imageUrl: p.imageUrl || null,
      price: current,
      ev: currentEv,
      previous,
      var1m: variation(current, previous),
      var3m: variation(current, p3),
      var6m: variation(current, p6)
    }
  })

  // Tri par défaut du plus récent au plus ancien (nulls à la fin)
  items.sort((a, b) => {
    if (a.releaseDate == null && b.releaseDate == null) return a.name.localeCompare(b.name)
    if (a.releaseDate == null) return 1
    if (b.releaseDate == null) return -1
    const da = new Date(a.releaseDate).getTime()
    const db = new Date(b.releaseDate).getTime()
    if (da !== db) return db - da // Du plus récent au plus ancien
    return a.name.localeCompare(b.name)
  })

  return { month, items }
})
