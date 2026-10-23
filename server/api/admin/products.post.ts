type Body = {
  name?: string
  category?: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'
  type?: string
  deckType?: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER' | null
  releaseDate?: string | null
}
const TYPES = ['DRAFT', 'SET', 'PLAY', 'COLLECTOR', 'OTHER']
const CATEGORIES = ['BOOSTER_BOX', 'SINGLE_BOOSTER', 'PRECON_DECK']
const DECK_TYPES = ['COMMANDER', 'CHALLENGER', 'STARTER', 'OTHER']

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<Body>(event)
  const name = body?.name?.trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nom requis' })
  const type = TYPES.includes(body.type ?? '') ? (body.type as never) : 'DRAFT'
  const category = CATEGORIES.includes(body.category ?? '') ? (body.category as never) : 'BOOSTER_BOX'
  const deckType = DECK_TYPES.includes(body.deckType ?? '') ? (body.deckType as never) : null
  const releaseDate = body.releaseDate ? new Date(body.releaseDate) : null
  if (releaseDate && Number.isNaN(releaseDate.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Date invalide' })
  }
  const standardLegalUntil = (body as any).standardLegalUntil ? new Date((body as any).standardLegalUntil) : null
  const isOutOfPrint = typeof (body as any).isOutOfPrint === 'boolean' ? (body as any).isOutOfPrint : null
  const stock = (body as any).stock != null && !isNaN(Number((body as any).stock)) ? Number((body as any).stock) : null

  try {
    const p = await prisma.product.create({
      data: {
        name,
        category: category as any,
        type,
        deckType: deckType as any,
        releaseDate,
        standardLegalUntil,
        isOutOfPrint,
        stock
      }
    })
    return { id: p.id }
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Ce produit existe déjà' })
  }
})
