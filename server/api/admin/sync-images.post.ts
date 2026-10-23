import { syncProductImages } from '../../utils/sync-images'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  try {
    return await syncProductImages()
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Erreur lors de la synchronisation des images'
    })
  }
})
