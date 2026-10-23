<script setup lang="ts">
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { Line } from 'vue-chartjs'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const route = useRoute()
const router = useRouter()
const { getIcon } = useSetIcons()

const idsQuery = computed(() => String(route.query.ids || ''))

// Récupération des produits pour la comparaison
const { data, error, refresh } = await useFetch<{
  products: {
    id: number
    name: string
    category: string
    type: string
    deckType: string | null
    releaseDate: string | null
    standardLegalUntil: string | null
    stock: number | null
    imageUrl: string | null
    cardmarket: string
    currentPrice: number | null
    firstPrice: number | null
    var1m: number | null
    varTotal: number | null
    lastEv: number | null
    evRatio: number | null
    history: { month: string; price: number; ev: number | null }[]
  }[]
}>(() => `/api/products/compare?ids=${idsQuery.value}`, {
  watch: [idsQuery]
})

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la comparaison', fatal: true })
}

const products = computed(() => data.value?.products ?? [])

// Récupération de l'ensemble du catalogue pour la recherche d'ajout
const { data: allProductsData } = await useFetch<{
  month: string | null
  items: {
    id: number
    name: string
    type: string
    category: string
    deckType?: string | null
    price: number | null
    imageUrl: string | null
  }[]
}>('/api/products', { lazy: true })

const allCatalog = computed(() => allProductsData.value?.items || [])

const searchQuery = ref('')
const isSearchOpen = ref(false)
const searchInputRef = ref<HTMLInputElement | null>(null)

const searchResults = computed(() => {
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return []
  const currentIds = new Set(products.value.map((p) => p.id))
  return allCatalog.value
    .filter((p) => !currentIds.has(p.id) && p.name.toLowerCase().includes(q))
    .slice(0, 8)
})

function addProduct(id: number) {
  const current = idsQuery.value ? idsQuery.value.split(',').map(Number).filter(Boolean) : []
  if (current.includes(id)) return
  if (current.length >= 5) {
    alert('Vous pouvez comparer jusqu’à 5 produits simultanément.')
    return
  }
  current.push(id)
  searchQuery.value = ''
  isSearchOpen.value = false
  router.push({ query: { ids: current.join(',') } })
}

function removeProduct(id: number) {
  const current = idsQuery.value.split(',').map(Number).filter((n) => n && n !== id)
  if (current.length) {
    router.push({ query: { ids: current.join(',') } })
  } else {
    router.push({ query: {} })
  }
}

// Duels populaires
const POPULAR_DUELS = [
  { label: '🔥 Modern Horizons 2 vs 3', ids: [283, 301] }, // fallback si IDs varient
  { label: '⚡ Kamigawa vs Phyrexia', searchA: 'Kamigawa: Neon Dynasty', searchB: 'Phyrexia: All Will Be One' },
  { label: '👑 Dominaria vs Ravnica Remastered', searchA: 'Dominaria Remastered', searchB: 'Ravnica Remastered' }
]

function launchDuelByName(nameA: string, nameB: string) {
  const pA = allCatalog.value.find((p) => p.name.toLowerCase().includes(nameA.toLowerCase()))
  const pB = allCatalog.value.find((p) => p.name.toLowerCase().includes(nameB.toLowerCase()))
  if (pA && pB) {
    router.push({ query: { ids: `${pA.id},${pB.id}` } })
  }
}

const compareMode = ref<'price' | 'percent'>('price')

const COLORS = [
  { border: '#5b8def', bg: 'rgba(91, 141, 239, 0.15)' },
  { border: '#4cb782', bg: 'rgba(76, 183, 130, 0.15)' },
  { border: '#f5a623', bg: 'rgba(245, 166, 35, 0.15)' },
  { border: '#e5604f', bg: 'rgba(229, 96, 79, 0.15)' },
  { border: '#b266ff', bg: 'rgba(178, 102, 255, 0.15)' }
]

// Liste unique et ordonnée de tous les mois présents dans les historiques
const allMonths = computed(() => {
  const monthsSet = new Set<string>()
  for (const p of products.value) {
    for (const h of p.history) {
      if (h.price > 0) monthsSet.add(h.month)
    }
  }
  return Array.from(monthsSet).sort()
})

const chartData = computed(() => {
  const labels = allMonths.value

  const datasets = products.value.map((p, idx) => {
    const color = COLORS[idx % COLORS.length]
    const priceMap = new Map(p.history.filter((h) => h.price > 0).map((h) => [h.month, h.price]))

    let initialPrice: number | null = null
    const firstRecorded = p.history.find((h) => h.price > 0)
    if (firstRecorded) {
      initialPrice = firstRecorded.price
    }

    const dataPoints = labels.map((m) => {
      const val = priceMap.get(m)
      if (val == null) return null

      if (compareMode.value === 'percent') {
        if (!initialPrice || initialPrice <= 0) return 0
        return Math.round(((val - initialPrice) / initialPrice) * 1000) / 10
      }
      return val
    })

    return {
      label: `${p.name} (${p.category === 'PRECON_DECK' ? (p.deckType || 'Deck') : p.type})`,
      data: dataPoints,
      borderColor: color.border,
      backgroundColor: color.bg,
      tension: 0.2,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: color.border,
      spanGaps: true
    }
  })

  return { labels, datasets }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: {
      display: true,
      labels: { color: '#e6e7ea', padding: 14 }
    },
    tooltip: {
      backgroundColor: '#1a1b1e',
      titleColor: '#e6e7ea',
      bodyColor: '#e6e7ea',
      borderColor: '#2b2d31',
      borderWidth: 1,
      padding: 10,
      callbacks: {
        label: (context: any) => {
          const val = context.raw
          if (val == null) return ''
          const label = context.dataset.label || ''
          return compareMode.value === 'percent'
            ? `${label} : ${val >= 0 ? '+' : ''}${val} %`
            : `${label} : ${val} €`
        }
      }
    }
  },
  scales: {
    x: { ticks: { color: '#9a9ca3' }, grid: { color: 'rgba(255,255,255,.05)' } },
    y: {
      ticks: {
        color: '#9a9ca3',
        callback: (v: any) => (compareMode.value === 'percent' ? `${v} %` : `${v} €`)
      },
      grid: { color: 'rgba(255,255,255,.05)' }
    }
  }
}))

const eur = (n: number | null | undefined) =>
  n == null
    ? '-'
    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'Comparateur de boîtes & scellés MTG | MTG Stats',
  ogTitle: 'Comparateur de boîtes & scellés MTG | MTG Stats',
  description: 'Comparez les trajectoires de prix, les cotes et les performances relatives de plusieurs boîtes de boosters Magic: The Gathering sur le marché européen.',
  ogDescription: 'Comparez les trajectoires de prix, les cotes et les performances relatives de plusieurs boîtes de boosters Magic: The Gathering sur le marché européen.',
  ogUrl: () => `${siteUrl.value}/compare`,
  ogType: 'website'
})
</script>

<template>
  <div class="compare-page">
    <NuxtLink to="/boxes" class="back">← Retour au catalogue des boîtes</NuxtLink>

    <section class="hero">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <span class="badge" style="background: rgba(91, 141, 239, 0.15); color: #7aa7ff; border: 1px solid rgba(91, 141, 239, 0.3);">
          ⚔️ Comparateur Face-à-Face
        </span>
        <span class="muted" style="font-size:0.85rem;">Jusqu'à 5 produits simultanés</span>
      </div>
      <h1>Comparateur de scellés Magic</h1>
      <p>
        Superposez les courbes de prix et comparez la rentabilité, l'EV, les performances relatives et le stock disponible de vos boîtes et produits scellés favoris.
      </p>
    </section>

    <!-- BARRE DE SÉLECTION & RECHERCHE DE PRODUITS -->
    <div class="card compare-selector-card">
      <div class="selector-header">
        <div style="flex: 1; min-width: 260px; position: relative;">
          <label style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px;">
            Ajouter un produit à la comparaison :
          </label>
          <div style="position: relative;">
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="input"
              style="width: 100%; padding-left: 36px;"
              placeholder="Rechercher une boîte, un booster ou un deck (ex: Modern Horizons, Kamigawa, Fallout...)"
              @focus="isSearchOpen = true"
            />
            <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); opacity: 0.6;">🔍</span>
          </div>

          <!-- Dropdown d'autocomplétion -->
          <div
            v-if="isSearchOpen && searchResults.length"
            class="search-dropdown card"
          >
            <div
              v-for="item in searchResults"
              :key="item.id"
              class="search-dropdown-item"
              @click="addProduct(item.id)"
            >
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="dropdown-thumb"
              />
              <img
                v-else-if="getIcon(item.name)?.icon"
                :src="getIcon(item.name)!.icon"
                :alt="getIcon(item.name)!.code"
                class="set-icon"
              />
              <div style="flex: 1; min-width: 0;">
                <div class="dropdown-title">{{ item.name }}</div>
                <div class="muted" style="font-size: 0.75rem;">
                  {{ item.category === 'PRECON_DECK' ? (item.deckType || 'Deck') : item.type }}
                </div>
              </div>
              <div style="font-weight: 700; font-size: 0.9rem; color: #4cb782;">
                {{ eur(item.price) }}
              </div>
              <button class="btn ghost" style="padding: 4px 10px; font-size: 0.75rem;">
                + Ajouter
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CHIPS DES PRODUITS SÉLECTIONNÉS -->
      <div v-if="products.length" class="selected-chips">
        <span class="muted" style="font-size: 0.8rem; align-self: center;">Comparés ({{ products.length }}/5) :</span>
        <div
          v-for="(p, idx) in products"
          :key="p.id"
          class="selected-chip"
          :style="{ borderColor: COLORS[idx % COLORS.length].border }"
        >
          <span
            class="color-dot"
            :style="{ backgroundColor: COLORS[idx % COLORS.length].border }"
          />
          <img
            v-if="p.imageUrl"
            :src="p.imageUrl"
            :alt="p.name"
            class="chip-thumb"
          />
          <span class="chip-name">{{ p.name }} ({{ p.type }})</span>
          <button
            class="chip-remove"
            title="Retirer"
            @click="removeProduct(p.id)"
          >
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- ÉTAT VIDE : MOINS DE 2 PRODUITS -->
    <div v-if="products.length < 2" class="card empty-compare-card">
      <div style="font-size: 3rem; margin-bottom: 12px;">⚖️</div>
      <h3 style="margin-bottom: 8px;">Sélectionnez au moins 2 boîtes pour comparer</h3>
      <p class="muted" style="max-width: 500px; margin: 0 auto 20px; line-height: 1.5;">
        Tapez le nom d'un produit dans la barre ci-dessus pour l'ajouter, ou lancez un duel classique en 1 clic :
      </p>

      <div class="popular-duels">
        <button
          v-for="duel in POPULAR_DUELS"
          :key="duel.label"
          class="btn ghost duel-btn"
          @click="launchDuelByName(duel.searchA || '', duel.searchB || '')"
        >
          {{ duel.label }}
        </button>
      </div>
    </div>

    <!-- VUE COMPARATIVE ACTIVE -->
    <div v-else>
      <!-- Graphique Comparatif -->
      <div class="card" style="margin-top: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div>
            <h3 style="margin: 0 0 4px 0;">Évolution comparée des cours</h3>
            <span class="muted" style="font-size: 0.8rem;">Historique mensuel des prix scellés</span>
          </div>
          <div class="chips">
            <button
              class="chip"
              :class="{ active: compareMode === 'price' }"
              style="padding: 5px 12px; font-size: 0.85rem;"
              @click="compareMode = 'price'"
            >
              Prix brut (€)
            </button>
            <button
              class="chip"
              :class="{ active: compareMode === 'percent' }"
              style="padding: 5px 12px; font-size: 0.85rem;"
              @click="compareMode = 'percent'"
            >
              Performance relative (%)
            </button>
          </div>
        </div>
        <div class="chart-box" style="height: 380px;">
          <ClientOnly>
            <Line :data="chartData" :options="chartOptions" />
          </ClientOnly>
        </div>
      </div>

      <!-- Tableau Comparatif Détaillé -->
      <div class="card table-wrap" style="margin-top: 24px;">
        <table>
          <thead>
            <tr>
              <th>Produit scellé</th>
              <th>Catégorie / Type</th>
              <th>Date sortie</th>
              <th class="num">Prix actuel</th>
              <th class="num">Variation 1M</th>
              <th class="num">Performance totale</th>
              <th class="num">EV estimée</th>
              <th class="num">Ratio EV/Prix</th>
              <th class="num">Stock</th>
              <th style="text-align: center;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in products" :key="p.id">
              <td class="name-cell">
                <div class="name-with-icon">
                  <span
                    class="color-dot"
                    :style="{ backgroundColor: COLORS[idx % COLORS.length].border }"
                  />
                  <img
                    v-if="p.imageUrl"
                    :src="p.imageUrl"
                    :alt="p.name"
                    class="table-thumb"
                  />
                  <img
                    v-else-if="getIcon(p.name)?.icon"
                    :src="getIcon(p.name)!.icon"
                    :alt="getIcon(p.name)!.code"
                    class="set-icon"
                  />
                  <div>
                    <NuxtLink class="name" :to="`/products/${p.id}`">{{ p.name }}</NuxtLink>
                    <div v-if="p.cardmarket" style="font-size: 0.72rem;">
                      <a :href="p.cardmarket" target="_blank" rel="noopener noreferrer" class="muted" style="text-decoration: underline;">
                        Cardmarket ↗
                      </a>
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span v-if="p.category === 'PRECON_DECK'" class="badge" :class="`badge-${(p.deckType || 'other').toLowerCase()}`">
                  {{ p.deckType || 'DECK' }}
                </span>
                <span v-else class="badge" :class="`badge-${p.type.toLowerCase()}`">{{ p.type }}</span>
              </td>
              <td class="muted">
                {{ p.releaseDate ? new Date(p.releaseDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-' }}
              </td>
              <td class="num" style="font-weight: 700; font-size: 1.05rem;">
                {{ eur(p.currentPrice) }}
              </td>
              <td class="num">
                <span
                  v-if="p.var1m != null"
                  class="tag-var"
                  :class="p.var1m >= 0 ? 'up' : 'down'"
                >
                  {{ p.var1m >= 0 ? '+' : '' }}{{ p.var1m }} %
                </span>
                <span v-else class="muted">-</span>
              </td>
              <td class="num">
                <span
                  v-if="p.varTotal != null"
                  class="tag-var"
                  :class="p.varTotal >= 0 ? 'up' : 'down'"
                >
                  {{ p.varTotal >= 0 ? '+' : '' }}{{ p.varTotal }} %
                </span>
                <span v-else class="muted">-</span>
              </td>
              <td class="num" style="color: #7aa7ff; font-weight: 600;">
                {{ eur(p.lastEv) }}
              </td>
              <td class="num">
                <span
                  v-if="p.evRatio != null"
                  class="tag-var"
                  :class="p.evRatio >= 100 ? 'up' : 'muted'"
                >
                  {{ p.evRatio }} %
                </span>
                <span v-else class="muted">-</span>
              </td>
              <td class="num" :style="{ color: p.stock && p.stock > 0 ? '#4cb782' : 'var(--muted)' }">
                {{ p.stock ?? '-' }}
              </td>
              <td style="text-align: center;">
                <button
                  class="btn ghost"
                  style="padding: 4px 8px; font-size: 0.75rem; border-color: rgba(229, 96, 79, 0.4); color: #e5604f;"
                  title="Retirer de la comparaison"
                  @click="removeProduct(p.id)"
                >
                  ✕ Retirer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.compare-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.compare-selector-card {
  padding: 18px 20px;
  position: relative;
  z-index: 10;
}

.selector-header {
  display: flex;
  gap: 16px;
  align-items: flex-end;
}

.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 320px;
  overflow-y: auto;
  background: #1a1b1e;
  border: 1px solid var(--accent);
  border-radius: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.6);
  z-index: 50;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.search-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background .15s ease;
}

.search-dropdown-item:hover {
  background: rgba(91, 141, 239, 0.15);
}

.dropdown-thumb {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
}

.dropdown-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.selected-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chip-thumb {
  width: 20px;
  height: 20px;
  object-fit: contain;
  border-radius: 3px;
}

.chip-name {
  white-space: nowrap;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-remove {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.chip-remove:hover {
  color: #e5604f;
}

.empty-compare-card {
  text-align: center;
  padding: 48px 24px;
  margin-top: 10px;
}

.popular-duels {
  display: flex;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
}

.duel-btn {
  font-size: 0.85rem;
  padding: 8px 16px;
  border-color: rgba(91, 141, 239, 0.3);
}

.duel-btn:hover {
  border-color: var(--accent);
  background: rgba(91, 141, 239, 0.15);
}

.table-thumb {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
}
</style>
