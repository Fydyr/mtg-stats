import { syncProductReleaseDates } from '../../utils/sync-release-dates'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    return await syncProductReleaseDates()
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Erreur lors de la synchronisation des dates de sortie'
    })
  }
})
