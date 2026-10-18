import { BoosterType } from '@prisma/client'

// GIDs découverts dans le Google Sheet officiel
const DEFAULT_SHEETS = [
  { gid: '0', type: BoosterType.DRAFT },
  { gid: '1133817197', type: BoosterType.SET },
  { gid: '585050124', type: BoosterType.PLAY },
  { gid: '2026919664', type: BoosterType.COLLECTOR }
]

function parseFullCsv(text: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (ch === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      currentRow.push(currentCell.trim())
      currentCell = ''
    } else if ((ch === '\r' || ch === '\n') && !inQuotes) {
      if (ch === '\r' && next === '\n') {
        i++
      }
      currentRow.push(currentCell.trim())
      if (currentRow.some((c) => c !== '')) {
        rows.push(currentRow)
      }
      currentRow = []
      currentCell = ''
    } else {
      currentCell += ch
    }
  }

  if (currentCell !== '' || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow)
    }
  }

  return rows
}

// Convertit un en-tête de date comme "07/2026", "2026-07" ou "Price 07/2026" en "YYYY-MM"
function parseMonthHeader(header: string): string | null {
  const clean = header.replace(/^Price\s+/i, '').trim()
  const m1 = clean.match(/^(\d{1,2})\/(\d{4})$/)
  if (m1) return `${m1[2]}-${m1[1].padStart(2, '0')}`
  const m2 = clean.match(/^(\d{4})-(\d{1,2})$/)
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}`
  return null
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readBody<{ sheetUrl?: string }>(event).catch(() => ({}))
  
  // Extraire l'ID du document Google Sheets
  const rawUrl = body?.sheetUrl || 'https://docs.google.com/spreadsheets/d/1668tbtGyFHhB-x3c9b7ft546PK3fsKMR8eK7iLCh0ps'
  const match = rawUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
  if (!match) {
    throw createError({ statusCode: 400, statusMessage: 'URL de Google Sheet invalide' })
  }
  const sheetId = match[1]

  let totalProducts = 0
  let totalPrices = 0

  for (const { gid, type } of DEFAULT_SHEETS) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    let csvText = ''
    try {
      csvText = await $fetch<string>(csvUrl, { responseType: 'text' })
    } catch (e: any) {
      console.warn(`[Sync] Impossible de lire l'onglet gid=${gid} (${type}):`, e?.message)
      continue
    }

    const rows = parseFullCsv(csvText)
    if (rows.length < 2) continue

    const header = rows[0]!
    const monthCols = header
      .map((h, i) => ({ month: parseMonthHeader(h), i }))
      .filter((c): c is { month: string; i: number } => c.month !== null)

    for (const row of rows.slice(1)) {
      const name = row[0]?.trim()
      if (
        !name ||
        name.length < 2 ||
        name.startsWith('#') ||
        name.startsWith('EDITION') ||
        name.toLowerCase().startsWith('total') ||
        name.toLowerCase().startsWith('moyenne')
      ) {
        continue
      }

      const rawDate = row[2]?.trim()
      let releaseDate: Date | null = null
      if (rawDate && !isNaN(Date.parse(rawDate))) {
        releaseDate = new Date(rawDate)
      }

      // Upsert du produit avec son type exact
      const product = await prisma.product.upsert({
        where: { name_type: { name, type } },
        update: { releaseDate: releaseDate ?? undefined },
        create: { name, type, releaseDate }
      })
      totalProducts++

      // Enregistrement des prix pour chaque mois disponible
      for (const { month, i } of monthCols) {
        const rawPrice = row[i]?.replace(',', '.').replace(/[^\d.]/g, '')
        if (!rawPrice) continue
        const price = Number(rawPrice)
        if (!Number.isFinite(price) || price <= 0) continue

        await prisma.priceSnapshot.upsert({
          where: { productId_month: { productId: product.id, month } },
          update: { price },
          create: { productId: product.id, month, price }
        })
        totalPrices++
      }
    }
  }

  return { ok: true, products: totalProducts, prices: totalPrices }
})
