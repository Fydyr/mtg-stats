import { syncExpectedValues } from '../utils/sync-ev'

export default defineNitroPlugin(() => {
  // Lance une synchronisation des Expected Values (EV) en arrière-plan au démarrage
  // pour garantir que les données EV (Scryfall Cardmarket EUR + MTGJSON + Dawnglare) sont à jour
  setTimeout(() => {
    syncExpectedValues()
      .then((res) => {
        console.log(
          `[Plugin EV] Synchronisation initiale terminée pour ${res.month} : ${res.matchedCount} produits mis à jour (${res.setsAnalyzed} extensions analysées).`
        )
      })
      .catch((err) => {
        console.warn('[Plugin EV] Synchronisation initiale différée :', err?.message || err)
      })
  }, 3000)
})

