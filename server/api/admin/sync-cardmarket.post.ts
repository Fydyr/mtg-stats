import { BoosterType } from '@prisma/client'

function cardmarketSlugify(name: string): string {
  return name
    .replace(/['’]/g, '')
    .replace(/[/:&+,.]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()
}

export function parseBoosterBoxName(rawName: string): { editionName: string; type: BoosterType } {
  let name = rawName.trim()
  let type: BoosterType = BoosterType.DRAFT

  if (/\bcollector(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.COLLECTOR
    name = name.replace(/\bcollector(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bplay(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.PLAY
    name = name.replace(/\bplay(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bset(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.SET
    name = name.replace(/\bset(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bdraft(?:\s+booster)?(?:\s+box)?\b/i.test(name)) {
    type = BoosterType.DRAFT
    name = name.replace(/\bdraft(?:\s+booster)?(?:\s+box)?\b/gi, '').trim()
  } else if (/\bjumpstart\b/i.test(name)) {
    type = BoosterType.OTHER
    name = name.replace(/\bbooster(?:\s+box)?\b/gi, '').trim()
  } else {
    type = BoosterType.DRAFT
    name = name.replace(/\bbooster(?:\s+box)?\b/gi, '').trim()
  }

  name = name.replace(/[-–—:]+$/, '').trim()
  if (!name) name = rawName.trim()

  return { editionName: name, type }
}

interface CmProduct {
  idProduct: number
  name: string
  idCategory: number
  categoryName?: string
  idExpansion?: number
}

interface CmPriceGuide {
  idProduct: number
  idCategory?: number
  avg?: number | null
  low?: number | null
  trend?: number | null
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody<{ month?: string; priceField?: 'trend' | 'low' | 'avg' }>(event).catch(() => ({}))
  const targetMonth = body?.month && /^\d{4}-\d{2}$/.test(body.month) ? body.month : undefined
  const priceFieldChoice = body?.priceField || 'low'

  try {
    return await syncCardmarketData(targetMonth, priceFieldChoice)
  } catch (err: any) {
    throw createError({
      statusCode: 502,
      statusMessage: err?.message || 'Erreur lors de la synchronisation Cardmarket'
    })
  }
})

