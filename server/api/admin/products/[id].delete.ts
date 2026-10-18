export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) throw createError({ statusCode: 400, statusMessage: 'ID invalide' })

  await prisma.product.delete({ where: { id } })
  return { ok: true }
})
