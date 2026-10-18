import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

const COOKIE = 'mtgstats_admin'

function sign(secret: string) {
  return createHmac('sha256', secret).update('admin').digest('hex')
}

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  return ba.length === bb.length && timingSafeEqual(ba, bb)
}

export function checkPassword(event: H3Event, password: string) {
  const { adminPassword } = useRuntimeConfig(event)
  if (!adminPassword) return false
  return safeEqual(password, adminPassword)
}

export function startAdminSession(event: H3Event) {
  const { sessionSecret } = useRuntimeConfig(event)
  setCookie(event, COOKIE, sign(sessionSecret), {
    httpOnly: true,
    sameSite: 'lax',
    secure: !import.meta.dev,
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  })
}

export function endAdminSession(event: H3Event) {
  deleteCookie(event, COOKIE, { path: '/' })
}

export function isAdmin(event: H3Event) {
  const { sessionSecret, adminPassword } = useRuntimeConfig(event)
  if (!sessionSecret || !adminPassword) return false
  const cookie = getCookie(event, COOKIE)
  return !!cookie && safeEqual(cookie, sign(sessionSecret))
}

export function requireAdmin(event: H3Event) {
  if (!isAdmin(event)) {
    throw createError({ statusCode: 401, statusMessage: 'Non autorisé' })
  }
}
