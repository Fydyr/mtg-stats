import { BoosterType } from '@prisma/client'
import { MONTH_RE } from '../../utils/months'

type Body = {
  month?: string
  prices?: { productId: number; price: number | null; cardmarketUrl?: string; type?: BoosterType }[]
}

const CM_RE = /^https:\/\/www\.cardmarket\.com\//

/** Enregistre (upsert) les prix d'un mois. Un prix null/vide supprime la ligne du mois. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<Body>(event)
  if (!body?.month || !MONTH_RE.test(body.month) || !Array.isArray(body.prices)) {
    throw createError({ statusCode: 400, statusMessage: 'Requête invalide' })
  }
  const month = body.month

  const extra: ReturnType<typeof prisma.product.update>[] = []
  const ops = body.prices.map((p) => {
    const productId = Number(p.productId)
    if (!Number.isInteger(productId)) {
      throw createError({ statusCode: 400, statusMessage: 'productId invalide' })
    }
    const url = p.cardmarketUrl?.trim()
    if (url && !CM_RE.test(url)) {
      throw createError({ statusCode: 400, statusMessage: 'Le lien doit commencer par https://www.cardmarket.com/' })
    }
    if (p.cardmarketUrl !== undefined || p.type !== undefined) {
      extra.push(prisma.product.update({
        where: { id: productId },
        data: {
          ...(p.cardmarketUrl !== undefined ? { cardmarketUrl: url || null } : {}),
          ...(p.type && p.type in BoosterType ? { type: p.type } : {})
        }
      }))
    }
    if (p.price == null || (p.price as unknown) === '') {
      return prisma.priceSnapshot.deleteMany({ where: { productId, month } })
    }
    const price = Number(p.price)
    if (!Number.isFinite(price) || price < 0) {
      throw createError({ statusCode: 400, statusMessage: `Prix invalide (produit ${productId})` })
    }
    return prisma.priceSnapshot.upsert({
      where: { productId_month: { productId, month } },
      update: { price },
      create: { productId, month, price }
    })
  })

  await prisma.$transaction([...extra, ...ops])
  return { ok: true, count: ops.length }
})
