import { cardmarketLink, shiftMonth, variation } from '../../utils/months'
import { syncProductReleaseDates } from '../../utils/sync-release-dates'
import { extractEditionName } from '../../utils/sync-ev'

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

  // Indexation des EV des boîtes par (nom d'extension nettoyé + type exact) pour fallback éventuel des boosters à l'unité
  const boxEvBySetAndType = new Map<string, number>()
  for (const p of products) {
    if (((p as any).category || 'BOOSTER_BOX') === 'BOOSTER_BOX') {
      const snapWithEv = p.prices.find((s) => s.month === month && s.ev != null && Number(s.ev) > 0)
        || p.prices.find((s) => s.ev != null && Number(s.ev) > 0)
      const ev = snapWithEv?.ev != null ? Number(snapWithEv.ev) : null
      const isVintage = p.releaseDate ? new Date(p.releaseDate).getFullYear() < 2003 : false
      const isBundle = /\b(?:bundle|fat\s*pack)\b/i.test(p.name) || (p.type as string) === 'BUNDLE'
      if (ev != null && ev > 0 && !isVintage && !isBundle && ev < 3500) {
        const cleanSet = extractEditionName(p.name).toLowerCase().trim()
        const key = `${cleanSet}_${p.type}`
        boxEvBySetAndType.set(key, ev)
      }
    }
  }

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
    const fallbackEvSnap = p.prices.find((s) => s.ev != null && Number(s.ev) > 0)
    const rawEv = currentSnap?.ev != null && Number(currentSnap.ev) > 0
      ? Number(currentSnap.ev)
      : fallbackEvSnap?.ev != null
        ? Number(fallbackEvSnap.ev)
        : null

    const isVintage = p.releaseDate ? new Date(p.releaseDate).getFullYear() < 2003 : false
    const cat = (p as any).category || 'BOOSTER_BOX'
    const isTheme = /\b(?:theme\s+booster|welcome\s+booster)\b/i.test(p.name)
    let currentEv: number | null = null

    if (!isVintage && !isTheme && cat !== 'PRECON_DECK') {
      if (rawEv != null && rawEv > 0 && rawEv < 3500) {
        currentEv = rawEv
      } else if (cat === 'SINGLE_BOOSTER') {
        // Fallback uniquement sur une boîte du MÊME type de booster (ex: COLLECTOR -> COLLECTOR)
        const cleanSet = extractEditionName(p.name).toLowerCase().trim()
        const key = `${cleanSet}_${p.type}`
        const parentBoxEv = boxEvBySetAndType.get(key)
        if (parentBoxEv) {
          const packCount = p.type === 'COLLECTOR' ? 12 : (p.type === 'SET' ? 30 : 36)
          currentEv = Number((parentBoxEv / packCount).toFixed(2))
        }
      }
    }

    // Validation stricte du ratio EV / Prix (entre 15% et 220%) :
    // si le ratio est hors limites, on masque à la fois l'EV et le ratio pour éviter toute incohérence d'affichage
    if (currentEv != null && current != null && current > 0) {
      const ratio = Math.round((currentEv / current) * 100)
      if (ratio < 15 || ratio > 220) {
        currentEv = null
      }
    } else {
      currentEv = null
    }

    // Mini-série chronologique (jusqu'aux 8 derniers relevés valides) pour les sparklines du catalogue
    const sparkline = [...p.prices]
      .filter((s) => Number(s.price) > 0)
      .slice(0, 8)
      .reverse()
      .map((s) => Number(s.price))

    return {
      id: p.id,
      name: p.name,
      category: cat,
      type: p.type,
      deckType: (p as any).deckType || null,
      releaseDate: p.releaseDate,
      standardLegalUntil: p.standardLegalUntil ? p.standardLegalUntil.toISOString().slice(0, 10) : null,
      stock: p.stock ?? null,
      cardmarket: cardmarketLink(p.name, p.type, p.cardmarketUrl, cat),
      imageUrl: p.imageUrl || null,
      price: current,
      ev: currentEv,
      previous,
      var1m: variation(current, previous),
      var3m: variation(current, p3),
      var6m: variation(current, p6),
      sparkline
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
