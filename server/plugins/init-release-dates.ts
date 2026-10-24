import { prisma } from '../utils/prisma'
import { syncProductReleaseDates } from '../utils/sync-release-dates'

export default defineNitroPlugin(async () => {
  try {
    // Vérifie s'il existe des boosters ou decks sans date de sortie
    const countMissing = await prisma.product.count({
      where: {
        category: { in: ['SINGLE_BOOSTER', 'PRECON_DECK'] },
        releaseDate: null
      }
    })

    if (countMissing > 0) {
      console.log(`[Plugin ReleaseDates] Détection de ${countMissing} boosters/decks sans date de sortie. Démarrage de la synchronisation automatique...`)
      syncProductReleaseDates().catch((err) => {
        console.error('[Plugin ReleaseDates] Erreur lors de la synchronisation automatique :', err?.message || err)
      })
    } else {
      console.log('[Plugin ReleaseDates] Tous les boosters et decks possèdent déjà une date de sortie.')
    }
  } catch (err: any) {
    console.warn('[Plugin ReleaseDates] Initialisation reportée :', err?.message || err)
  }
})
