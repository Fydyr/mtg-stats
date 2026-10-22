export type SetIconInfo = {
  code: string
  icon: string
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
    lazy: true,
    server: true,
    default: () => ({})
  })

  function getIcon(setName: string): SetIconInfo | null {
    if (!setName || !icons.value) return null
    const key = normalizeKey(setName)
    if (icons.value[key]) return icons.value[key]

    // Recherche par inclusion si nom légèrement différent
    for (const [k, v] of Object.entries(icons.value)) {
      if (k.length >= 5 && (key.includes(k) || k.includes(key))) {
        return v
      }
    }
    return null
  }

  return { icons, getIcon }
}
