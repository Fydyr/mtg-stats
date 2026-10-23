import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const res = await prisma.product.updateMany({
    where: {
      name: { contains: 'Foundation', mode: 'insensitive' }
    },
    data: {
      standardLegalUntil: new Date('2029-12-31T23:59:59Z')
    }
  })
  console.log(`[Admin] ${res.count} produit(s) Foundations configurés avec fin de légalité Standard au 31/12/2029.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
