import { PrismaClient, BoosterType } from '@prisma/client'

const prisma = new PrismaClient()

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

function parseMonthHeader(header: string): string | null {
  const clean = header.replace(/^Price\s+/i, '').trim()
  const m1 = clean.match(/^(\d{1,2})\/(\d{4})$/)
  if (m1) return `${m1[2]}-${m1[1].padStart(2, '0')}`
  const m2 = clean.match(/^(\d{4})-(\d{1,2})$/)
  if (m2) return `${m2[1]}-${m2[2].padStart(2, '0')}`
  return null
}

async function main() {
  const sheetId = '1668tbtGyFHhB-x3c9b7ft546PK3fsKMR8eK7iLCh0ps'
  let totalProducts = 0
  let totalPrices = 0

  for (const { gid, type } of DEFAULT_SHEETS) {
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
    console.log(`[Sync Sheet] Récupération onglet ${type} (gid=${gid})...`)
    const res = await fetch(csvUrl)
    const csvText = await res.text()
    const rows = parseFullCsv(csvText)

    if (rows.length < 2) continue

    const header = rows[0]!
    const monthCols = header
      .map((h, i) => ({ month: parseMonthHeader(h), i }))
      .filter((c): c is { month: string; i: number } => c.month !== null)

    console.log(`[Sync Sheet] Mois détectés pour ${type}:`, monthCols.map((m) => m.month).join(', '))

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

      const product = await prisma.product.upsert({
        where: { name_type: { name, type } },
        update: { releaseDate: releaseDate ?? undefined },
        create: { name, type, releaseDate }
      })
      totalProducts++

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

  console.log(`[Sync Sheet] Terminé avec succès : ${totalProducts} boîtes et ${totalPrices} prix mensuels importés !`)
  await prisma.$disconnect()
}

main().catch(console.error)
