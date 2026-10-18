import { BoosterType } from '@prisma/client'
import { MONTH_RE } from '../../utils/months'

interface SyncPriceItem {
  name: string
  type?: keyof typeof BoosterType
  price: number
  releaseDate?: string
  cardmarketUrl?: string
}

interface SyncBody {
  month: string
  items: SyncPriceItem[]
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const syncSecret = config.syncSecret || process.env.NUXT_SYNC_SECRET

  // Vérification de sécurité si un token est configuré
  if (syncSecret) {
    const authHeader = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
    const customHeader = getHeader(event, 'x-sync-secret')
    if (authHeader !== syncSecret && customHeader !== syncSecret) {
      throw createError({ statusCode: 401, statusMessage: 'Token de synchronisation invalide' })
    }
  }

  const body = await readBody<SyncBody>(event)
  if (!body?.month || !MONTH_RE.test(body.month) || !Array.isArray(body.items)) {
    throw createError({ statusCode: 400, statusMessage: 'Format invalide (month YYYY-MM et items requis)' })
  }

  let count = 0
  for (const item of body.items) {
    const name = item.name?.trim()
    if (!name || typeof item.price !== 'number' || item.price <= 0) continue

    const type = (item.type && item.type in BoosterType) ? (item.type as BoosterType) : BoosterType.DRAFT
    const releaseDate = item.releaseDate ? new Date(item.releaseDate) : undefined

    const product = await prisma.product.upsert({
      where: { name_type: { name, type } },
      update: {
        ...(releaseDate && !isNaN(releaseDate.getTime()) ? { releaseDate } : {}),
        ...(item.cardmarketUrl ? { cardmarketUrl: item.cardmarketUrl } : {})
      },
      create: {
        name,
        type,
        releaseDate: releaseDate && !isNaN(releaseDate.getTime()) ? releaseDate : null,
        cardmarketUrl: item.cardmarketUrl || null
      }
    })

    await prisma.priceSnapshot.upsert({
      where: { productId_month: { productId: product.id, month: body.month } },
      update: { price: item.price },
      create: { productId: product.id, month: body.month, price: item.price }
    })
    count++
  }

  return { ok: true, month: body.month, updated: count }
})
