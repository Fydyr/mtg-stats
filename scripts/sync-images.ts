import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function run() {
  console.log('[Images Sync] Téléchargement de SetList.json depuis MTGJSON...')
  const res = await fetch('https://mtgjson.com/api/v5/SetList.json')
  const json = (await res.json()) as { data: any[] }

  const mcmMap = new Map<number, string>()
  const nameMap = new Map<string, string>()

  for (const set of json.data) {
    for (const sp of set.sealedProduct || []) {
      const tcgId = sp.identifiers?.tcgplayerProductId
      if (!tcgId) continue

      if (sp.identifiers?.mcmId) {
        const id = Number(sp.identifiers.mcmId)
        if (!isNaN(id)) mcmMap.set(id, String(tcgId))
      }

      if (sp.name) {
        nameMap.set(sp.name.toLowerCase().trim(), String(tcgId))
      }
    }
  }

  console.log(`[Images Sync] ${mcmMap.size} mappings Cardmarket -> TCGplayer trouvés, ${nameMap.size} par nom.`)

  const products = await prisma.product.findMany()
  console.log(`[Images Sync] Analyse de ${products.length} produits en base...`)

  let updated = 0

  for (const p of products) {
    let tcgId: string | undefined

    if (p.cardmarketId && mcmMap.has(p.cardmarketId)) {
      tcgId = mcmMap.get(p.cardmarketId)
    } else {
      const cleanName = p.name.toLowerCase().trim()
      tcgId = nameMap.get(cleanName)
    }

    if (tcgId) {
      const imgUrl = `https://tcgplayer-cdn.tcgplayer.com/product/${tcgId}_200w.jpg`
      if (p.imageUrl !== imgUrl) {
        await prisma.product.update({
          where: { id: p.id },
          data: { imageUrl: imgUrl }
        })
        updated++
      }
    }
  }

  console.log(`[Images Sync] ${updated} produits mis à jour avec une image officielle !`)
  const totalWithImage = await prisma.product.count({ where: { imageUrl: { not: null } } })
  console.log(`[Images Sync] Total de produits avec image en base : ${totalWithImage}/${products.length}`)
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
