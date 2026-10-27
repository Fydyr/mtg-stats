/** Retourne le mois précédent (YYYY-MM) d'un mois donné, avec un décalage de n mois. */
export function shiftMonth(month: string, delta: number) {
  const [y, m] = month.split('-').map(Number) as [number, number]
  const d = new Date(Date.UTC(y, m - 1 + delta, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

export const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/

/**
 * Génère dynamiquement le lien Cardmarket pour n'importe quel produit sans aucun produit codé en dur.
 */
export function cardmarketLink(
  name: string,
  type = 'DRAFT',
  url?: string | null,
  category: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK' = 'BOOSTER_BOX'
): string {
  // 1. Si une URL personnalisée manuelle a été saisie dans l'admin / DB
  if (url && url.startsWith('http')) {
    return url
  }

  // 2. Si c'est un deck préconstruit ou un bundle, ouvrir la recherche Cardmarket
  if (category === 'PRECON_DECK' || type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(name)) {
    return `https://www.cardmarket.com/fr/Magic/Products/Search?searchString=${encodeURIComponent(name).replace(/%20/g, '+')}`
  }

  // Nettoyage dynamique standard du nom pour deviner le slug Cardmarket
  const cleanName = name
    .replace(/['’]/g, '')
    .replace(/[/:&|,.]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .trim()

  // 3. Si c'est un booster individuel
  if (category === 'SINGLE_BOOSTER') {
    let suffix = 'Booster'
    if (type === 'COLLECTOR') suffix = 'Collector-Booster'
    else if (type === 'SET') suffix = 'Set-Booster'
    else if (type === 'PLAY') suffix = 'Play-Booster'
    else if (type === 'DRAFT') suffix = 'Draft-Booster'
    return `https://www.cardmarket.com/fr/Magic/Products/Boosters/${cleanName}-${suffix}`
  }

  // 4. Si c'est une boîte de boosters
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
  if (current == null || previous == null || previous <= 0 || current <= 0) return null
  const diff = ((current - previous) / previous) * 100
  // Une chute à -100% ou proche de 0 est le signe d'un bug d'import ou d'absence de prix
  if (diff <= -95) return null
  return diff
}
