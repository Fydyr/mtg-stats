export type SetIconInfo = {
  code: string
  icon: string
}

const GENERIC_PREFIXES = new Set([
  'commander',
  'secretlair',
  'secretlairdrop',
  'secretlairdropseries',
  'universesbeyond',
  'dueldecks',
  'fromthevault',
  'challengerdecks',
  'challengerdeck',
  'starterkit',
  'signaturespellbook',
  'guildkit',
  'planechase',
  'archenemy'
])

function cleanProductToSetName(raw: string): string {
  return raw
    .replace(/\buniverses\s+beyond\s*:\s*/gi, '')
    .replace(/\bsecret\s+lair\s+bundle\b/gi, '')
    .replace(/\bsecret\s+lair\s+drop\s+series\b/gi, 'Secret Lair')
    .replace(/\b(?:draft|play|set|collector|theme|jumpstart|beyond)\s+booster\s+(?:box|display|pack)\b/gi, '')
    .replace(/\b(?:draft|play|set|collector|theme|jumpstart|beyond)\s+booster\b/gi, '')
    .replace(/\bbooster\s+(?:box|display|pack)\b/gi, '')
    .replace(/\b(?:gift\s+edition\s+bundle|gift\s+bundle|compleat\s+edition\s+bundle|nightmare\s+bundle|bundle|fat\s*pack)\b/gi, '')
    .replace(/\b(?:booster|display|box)\b/gi, '')
    .replace(/[-–—:]+$/, '')
    .trim()
}

function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

export const useSetIcons = () => {
  const { data: icons } = useFetch<Record<string, SetIconInfo>>('/api/sets/icons', {
    server: true,
    default: () => ({})
  })

  function getIcon(setName: string): SetIconInfo | null {
    if (!setName || !icons.value) return null
    const map = icons.value

    const rawKey = normalizeKey(setName)
    if (map[rawKey]) return map[rawKey]

    const cleanKey = normalizeKey(cleanProductToSetName(setName))
    if (cleanKey && !GENERIC_PREFIXES.has(cleanKey) && map[cleanKey]) return map[cleanKey]

    // Cas spécifiques Secret Lair (uniquement si ce n'est pas un "<Extension> Secret Lair Bundle" déjà reconnu)
    if (/\bsecret\s+lair\b/i.test(setName)) {
      if (/\b30th\s+anniversary\b/i.test(setName) && map['slc']) return map['slc']
      if (/\bultimate\s+edition\b/i.test(setName) && map['slu']) return map['slu']
      if (map['sld']) return map['sld']
    }

    // Si le nom contient ":" (ex: "Commander: Ikoria" ou "Time Spiral: Reality Fracture"),
    // tester chaque segment non générique
    if (setName.includes(':')) {
      const parts = setName.split(':').map((s) => normalizeKey(cleanProductToSetName(s)))
      for (const partKey of parts) {
        if (partKey.length >= 4 && !GENERIC_PREFIXES.has(partKey) && map[partKey]) {
          return map[partKey]
        }
      }
    }

    // Recherche par inclusion en triant les clés de la plus longue à la plus courte
    const target = cleanKey || rawKey
    const sortedEntries = Object.entries(map)
      .filter(([k]) => k.length >= 5 && !GENERIC_PREFIXES.has(k))
      .sort((a, b) => b[0].length - a[0].length)

    for (const [k, v] of sortedEntries) {
      if (target.includes(k) || k.includes(target)) {
        return v
      }
    }
    return null
  }

  return { icons, getIcon }
}
