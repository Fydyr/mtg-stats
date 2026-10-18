/** Retourne le mois précédent (YYYY-MM) d'un mois donné, avec un décalage de n mois. */
export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number) as [number, number]
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

const SPECIAL_SLUGS: Record<string, string> = {
  'Ravnica Allegiance': 'Ravnica-Allegiance-Booster-Box',
  "Assassin's Creed": 'Universes-Beyond-Assassins-Creed-Collector-Booster-Box',
  'Assassin’s Creed': 'Universes-Beyond-Assassins-Creed-Collector-Booster-Box',
  "Universes Beyond: Assassin's Creed": 'Universes-Beyond-Assassins-Creed-Collector-Booster-Box',
  'The Lord of the Rings: Tales of Middle-earth': 'The-Lord-of-the-Rings-Tales-of-Middle-earth-Draft-Booster-Box',
  "Commander Legends: Battle for Baldur's Gate": 'Commander-Legends-Battle-for-Baldurs-Gate-Draft-Booster-Box',
  "Battle for Baldur's Gate / Commander Legends 2": 'Commander-Legends-Battle-for-Baldurs-Gate-Draft-Booster-Box',
  'Dungeons & Dragons: Adventures in the Forgotten Realms': 'Adventures-in-the-Forgotten-Realms-Draft-Booster-Box',
  'Adventures in the Forgotten Realms': 'Adventures-in-the-Forgotten-Realms-Draft-Booster-Box',
  'March of the Machine: The Aftermath': 'March-of-the-Machine-The-Aftermath-Epilogue-Booster-Box',
  'Modern Horizons 3': 'Modern-Horizons-3-Play-Booster-Box',
  'Modern Horizons 2': 'Modern-Horizons-2-Draft-Booster-Box',
  'Modern Horizons': 'Modern-Horizons-Booster-Box',
  'Kamigawa: Neon Dynasty': 'Kamigawa-Neon-Dynasty-Draft-Booster-Box',
  'Bloomburrow': 'Bloomburrow-Play-Booster-Box',
  'Duskmourn: House of Horror': 'Duskmourn-House-of-Horror-Play-Booster-Box',
  'Outlaws of Thunder Junction': 'Outlaws-of-Thunder-Junction-Play-Booster-Box',
  'Murders at Karlov Manor': 'Murders-at-Karlov-Manor-Play-Booster-Box',
  'The Lost Caverns of Ixalan': 'The-Lost-Caverns-of-Ixalan-Draft-Booster-Box',
  'Wilds of Eldraine': 'Wilds-of-Eldraine-Draft-Booster-Box',
  'Phyrexia: All Will Be One': 'Phyrexia-All-Will-Be-One-Draft-Booster-Box',
  "The Brothers' War": 'The-Brothers-War-Draft-Booster-Box',
  'Dominaria United': 'Dominaria-United-Draft-Booster-Box',
  'Streets of New Capenna': 'Streets-of-New-Capenna-Draft-Booster-Box',
  'Innistrad: Crimson Vow': 'Innistrad-Crimson-Vow-Draft-Booster-Box',
  'Innistrad: Midnight Hunt': 'Innistrad-Midnight-Hunt-Draft-Booster-Box',
  'Strixhaven: School of Mages': 'Strixhaven-School-of-Mages-Draft-Booster-Box',
  'Kaldheim': 'Kaldheim-Draft-Booster-Box',
  'Zendikar Rising': 'Zendikar-Rising-Draft-Booster-Box',
  'Ikoria: Lair of Behemoths': 'Ikoria-Lair-of-Behemoths-Draft-Booster-Box',
  'Theros Beyond Death': 'Theros-Beyond-Death-Booster-Box',
  'Throne of Eldraine': 'Throne-of-Eldraine-Booster-Box',
  'War of the Spark': 'War-of-the-Spark-Booster-Box',
  'Guilds of Ravnica': 'Guilds-of-Ravnica-Booster-Box',
  'Dominaria': 'Dominaria-Booster-Box',
  'Rivals of Ixalan': 'Rivals-of-Ixalan-Booster-Box',
  'Ixalan': 'Ixalan-Booster-Box',
  'Hour of Devastation': 'Hour-of-Devastation-Booster-Box',
  'Amonkhet': 'Amonkhet-Booster-Box',
  'Aether Revolt': 'Aether-Revolt-Booster-Box',
  'Kaladesh': 'Kaladesh-Booster-Box',
  'Eldritch Moon': 'Eldritch-Moon-Booster-Box',
  'Shadows over Innistrad': 'Shadows-over-Innistrad-Booster-Box',
  'Oath of the Gatewatch': 'Oath-of-the-Gatewatch-Booster-Box',
  'Battle for Zendikar': 'Battle-for-Zendikar-Booster-Box',
  'Khans of Tarkir': 'Khans-of-Tarkir-Booster-Box',
  'Fate Reforged': 'Fate-Reforged-Booster-Box',
  'Dragons of Tarkir': 'Dragons-of-Tarkir-Booster-Box',
  'Modern Masters 2015 Edition': 'Modern-Masters-2015-Booster-Box',
  'Modern Masters 2017 Edition': 'Modern-Masters-2017-Booster-Box',
  'Double Masters': 'Double-Masters-Booster-Box',
  'Double Masters 2022': 'Double-Masters-2022-Draft-Booster-Box',
  'Double Masters 2022 Edition': 'Double-Masters-2022-Draft-Booster-Box',
  'Time Spiral Remastered': 'Time-Spiral-Remastered-Draft-Booster-Box',
  'Dominaria Remastered': 'Dominaria-Remastered-Draft-Booster-Box',
  'Ravnica Remastered': 'Ravnica-Remastered-Draft-Booster-Box',
  'Mystery Booster': 'Mystery-Booster-Booster-Box',
  'Mystery Booster Convention': 'Mystery-Booster-Convention-Edition-Booster-Box',
  'Mystery Booster 2': 'Mystery-Booster-2-Booster-Box',
  'Jumpstart': 'Jumpstart-Booster-Box',
  'Jumpstart 2022': 'Jumpstart-2022-Booster-Box'
}

// Éditions anciennes (1993-1996) qui n'ont pas de fiche Booster Box active sur Cardmarket
const VINTAGE_NO_DIRECT_BOX = new Set([
  'Alpha',
  'Beta',
  'Unlimited',
  'Arabian Nights',
  'Antiquities',
  'Legends',
  'The Dark',
  'Fallen Empires',
  'Homelands',
  'Alliances'
])

/** Génère l'URL Cardmarket la plus fiable (directe ou recherche) */
export function cardmarketLink(name: string, type = 'DRAFT', url?: string | null): string {
  // 1. Si une URL personnalisée manuelle a été saisie dans l'admin (qui n'est pas un vieux lien Alpha/Beta cassé)
  if (url && url.startsWith('http') && !url.includes('Alpha-Booster') && !url.includes('Beta-Booster') && !url.includes('Unlimited-Booster')) {
    return url
  }

  // 2. Si c'est une édition vintage sans fiche booster box active, on ouvre la recherche pour éviter "Produit invalide !"
  if (VINTAGE_NO_DIRECT_BOX.has(name)) {
    return `https://www.cardmarket.com/fr/Magic/Products/Search?searchString=${encodeURIComponent(`${name} Booster Box`).replace(/%20/g, '+')}`
  }

  // 3. Si on a un slug prédéfini vérifié
  if (SPECIAL_SLUGS[name]) {
    let slug = SPECIAL_SLUGS[name]
    if (type === 'COLLECTOR' && !slug.includes('Collector')) {
      slug = slug.replace(/(?:-(?:Draft|Set|Play))?-Booster-Box$/, '-Collector-Booster-Box')
    } else if (type === 'SET' && !slug.includes('Set')) {
      slug = slug.replace(/(?:-(?:Draft|Collector|Play))?-Booster-Box$/, '-Set-Booster-Box')
    } else if (type === 'PLAY' && !slug.includes('Play')) {
      slug = slug.replace(/(?:-(?:Draft|Collector|Set))?-Booster-Box$/, '-Play-Booster-Box')
    }
    return `https://www.cardmarket.com/fr/Magic/Products/Booster-Boxes/${slug}`
  }

  // 4. Nettoyage standard du nom pour deviner le slug Cardmarket
  const cleanName = name
    .replace(/['’]/g, '')
    .replace(/[/:&|,.]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()

  let suffix = 'Booster-Box'
  if (type === 'COLLECTOR') suffix = 'Collector-Booster-Box'
  else if (type === 'SET') suffix = 'Set-Booster-Box'
  else if (type === 'PLAY') suffix = 'Play-Booster-Box'
  else if (type === 'DRAFT') {
    if (cleanName.includes('Booster')) suffix = 'Box'
    else suffix = 'Draft-Booster-Box'
  }

  if (cleanName.endsWith('Booster-Box')) {
    return `https://www.cardmarket.com/fr/Magic/Products/Booster-Boxes/${cleanName}`
  }

  return `https://www.cardmarket.com/fr/Magic/Products/Booster-Boxes/${cleanName}-${suffix}`
}

export function variation(current: number | null, previous: number | null) {
  if (current == null || previous == null || previous === 0) return null
  return ((current - previous) / previous) * 100
}
