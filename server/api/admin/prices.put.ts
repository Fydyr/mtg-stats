import { BoosterType } from '@prisma/client'
import { MONTH_RE } from '../../utils/months'

type Body = {
  month?: string
  prices?: {
    productId: number
    price: number | null
    ev?: number | null
    cardmarketUrl?: string
    type?: BoosterType
    releaseDate?: string | null
    standardLegalUntil?: string | null
    isOutOfPrint?: boolean | null
    stock?: number | null
  }[]
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
    if (
      p.cardmarketUrl !== undefined ||
      p.type !== undefined ||
      p.releaseDate !== undefined ||
      p.standardLegalUntil !== undefined ||
      p.isOutOfPrint !== undefined ||
      p.stock !== undefined
    ) {
      let rDate: Date | null | undefined = undefined
      if (p.releaseDate !== undefined) {
        rDate = p.releaseDate ? new Date(p.releaseDate) : null
      }
      let sDate: Date | null | undefined = undefined
      if (p.standardLegalUntil !== undefined) {
        sDate = p.standardLegalUntil ? new Date(p.standardLegalUntil) : null
      }
      extra.push(prisma.product.update({
        where: { id: productId },
        data: {
          ...(p.cardmarketUrl !== undefined ? { cardmarketUrl: url || null } : {}),
          ...(p.type && (p.type as any) === 'BUNDLE' ? { type: BoosterType.OTHER } : p.type && p.type in BoosterType ? { type: p.type } : {}),
          ...(p.releaseDate !== undefined ? { releaseDate: rDate } : {}),
          ...(p.standardLegalUntil !== undefined ? { standardLegalUntil: sDate } : {}),
          ...(p.isOutOfPrint !== undefined ? { isOutOfPrint: p.isOutOfPrint } : {}),
          ...(p.stock !== undefined ? { stock: p.stock != null ? Number(p.stock) : null } : {})
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
    const evVal = p.ev != null && !isNaN(Number(p.ev)) && Number(p.ev) >= 0 ? Number(p.ev) : null
    return prisma.priceSnapshot.upsert({
      where: { productId_month: { productId, month } },
      update: { price, ...(p.ev !== undefined ? { ev: evVal } : {}) },
      create: { productId, month, price, ev: evVal }
    })
  })

  await prisma.$transaction([...extra, ...ops])
  return { ok: true, count: ops.length }
})
