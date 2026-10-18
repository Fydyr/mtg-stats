import { Cron } from 'croner'
import { syncCardmarketData } from '../utils/sync-cardmarket'

export default defineNitroPlugin(() => {
  // Planification : chaque lundi à 04h00 (fuseau Europe/Paris)
  // Expression cron standard : minute heure jour-du-mois mois jour-de-la-semaine (1 = lundi)
  const job = new Cron('0 4 * * 1', { timezone: 'Europe/Paris' }, async () => {
    console.log('[Cron Cardmarket] Déclenchement de la synchronisation hebdomadaire automatique...')
    try {
      const res = await syncCardmarketData()
      console.log(
        `[Cron Cardmarket] Synchronisation réussie pour ${res.month} : ${res.productsCount} boîtes traitées, ${res.pricesCount} prix enregistrés.`
      )
    } catch (err: any) {
      console.error('[Cron Cardmarket] Erreur lors de la synchronisation hebdomadaire :', err?.message || err)
    }
  })

  const next = job.nextRun()
  console.log(
    `[Cron Cardmarket] Planification hebdomadaire active (chaque lundi à 04h00). Prochaine exécution prévue : ${
      next ? next.toLocaleString('fr-FR', { timeZone: 'Europe/Paris' }) : 'inconnue'
    }`
  )
})
