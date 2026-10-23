import { syncProductImages } from '../../utils/sync-images'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const syncSecret = config.syncSecret || process.env.NUXT_SYNC_SECRET

  if (syncSecret) {
    const authHeader = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
    const customHeader = getHeader(event, 'x-sync-secret')
    if (authHeader !== syncSecret && customHeader !== syncSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Token de synchronisation invalide' })
    }
  }

  try {
    return await syncProductImages()
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Erreur lors de la synchronisation des images'
    })
  }
})
