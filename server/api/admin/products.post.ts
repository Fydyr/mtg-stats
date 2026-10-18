type Body = { name?: string; type?: string; releaseDate?: string | null }
const TYPES = ['DRAFT', 'SET', 'PLAY', 'COLLECTOR', 'OTHER']

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<Body>(event)
  const name = body?.name?.trim()
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Nom requis' })
  const type = TYPES.includes(body.type ?? '') ? (body.type as never) : 'DRAFT'
  const releaseDate = body.releaseDate ? new Date(body.releaseDate) : null
  if (releaseDate && Number.isNaN(releaseDate.getTime())) {
    throw createError({ statusCode: 400, statusMessage: 'Date invalide' })
  }

  try {
    const p = await prisma.product.create({ data: { name, type, releaseDate } })
    return { id: p.id }
  } catch {
    throw createError({ statusCode: 409, statusMessage: 'Ce produit existe déjà' })
  }
})
