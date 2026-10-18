import { syncExpectedValues } from '../../utils/sync-ev'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ month?: string }>(event).catch(() => ({}))
  const targetMonth = body?.month && /^\d{4}-\d{2}$/.test(body.month) ? body.month : undefined

  try {
    return await syncExpectedValues(targetMonth)
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Erreur lors de la récupération des EV'
    })
  }
})
