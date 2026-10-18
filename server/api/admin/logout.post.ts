export default defineEventHandler((event) => {
  endAdminSession(event)
  return { ok: true }
})
