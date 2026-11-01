import { syncExpectedValues } from '../server/utils/sync-ev'
import { prisma } from '../server/utils/prisma'

async function main() {
  const monthArg = process.argv[2]
  const res = await syncExpectedValues(monthArg)
  console.log(`[CLI EV Sync] Succès :`, res)
}

main()
  .catch((err) => {
    console.error('[CLI EV Sync] Erreur :', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

