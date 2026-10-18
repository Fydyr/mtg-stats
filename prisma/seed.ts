import { PrismaClient } from '@prisma/client'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const prisma = new PrismaClient()

async function main() {
  const file = join(process.cwd(), 'prisma', 'data', 'boosters.csv')
  if (!existsSync(file)) {
    console.log('[Seed] Aucun fichier boosters.csv présent, base initialisée vierge.')
    return
  }

  // Si un fichier est présent ultérieurement, il peut être importé
  console.log('[Seed] Fichier boosters.csv détecté.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
