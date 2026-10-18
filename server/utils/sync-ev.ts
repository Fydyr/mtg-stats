/**
 * Synchronise les Expected Values (EV) des boîtes de boosters depuis Dawnglare.
 */
export async function syncExpectedValues(targetMonth?: string) {
  const month = targetMonth || new Date().toISOString().slice(0, 7)
  console.log(`[EV Sync] Récupération des Expected Values pour ${month}...`)

  const html = await $fetch<string>('https://mtg.dawnglare.com/?p=sets', { responseType: 'text' })

  const regex = /<div class="cP"[^>]*>\$([\d,.]+)<\/div><div class="cN">(?:<a[^>]*>)?([^<]+)(?:<\/a>)?<\/div>/gi
  const evMap = new Map<string, number>()

  let m
  while ((m = regex.exec(html)) !== null) {
    const evVal = parseFloat(m[1].replace(/,/g, ''))
    const setName = m[2].trim().toLowerCase()
    evMap.set(setName, evVal)
  }

  // Taux de conversion approximatif USD -> EUR
  const USD_TO_EUR = 0.92

  const products = await prisma.product.findMany()
  let matchedCount = 0

  for (const product of products) {
    const pName = product.name.trim().toLowerCase()
    let evUsd = evMap.get(pName)

    if (evUsd === undefined) {
      for (const [dName, val] of evMap.entries()) {
        if (pName.includes(dName) || dName.includes(pName)) {
          evUsd = val
          break
        }
      }
    }

    if (evUsd !== undefined && evUsd > 0) {
      const evEur = Math.round(evUsd * USD_TO_EUR * 100) / 100

      // Vérifier si un snapshot existe pour ce mois
      const snap = await prisma.priceSnapshot.findUnique({
        where: { productId_month: { productId: product.id, month } }
      })

      if (snap) {
        await prisma.priceSnapshot.update({
          where: { id: snap.id },
          data: { ev: evEur }
        })
        matchedCount++
      } else {
        // Crée le snapshot avec l'EV et le prix hérité ou 0
        await prisma.priceSnapshot.create({
          data: {
            productId: product.id,
            month,
            price: 0,
            ev: evEur
          }
        })
        matchedCount++
      }
    }
  }

  console.log(`[EV Sync] Terminé : ${matchedCount} boîtes associées avec leur EV pour ${month}.`)
  return { ok: true, month, matchedCount }
}
