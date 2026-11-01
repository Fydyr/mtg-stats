<script setup lang="ts">
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { Line } from 'vue-chartjs'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const route = useRoute()
const router = useRouter()
const { getIcon } = useSetIcons()

// Supporte à la fois ?ids=344,566&qty=2,1 et ?pack=344:2,566:1 (100% encodé dans l'URL, zéro stockage navigateur)
const parsedPack = computed(() => {
  const map = new Map<number, number>()
  const packStr = String(route.query.pack || '').trim()
  if (packStr) {
    for (const part of packStr.split(',')) {
      const [idStr, qStr] = part.split(':')
      const id = Number(idStr)
      const q = Math.min(99, Math.max(1, Number(qStr) || 1))
      if (Number.isInteger(id) && id > 0) map.set(id, q)
    }
    return map
  }
  const idsStr = String(route.query.ids || '').trim()
  const qtyParts = String(route.query.qty || '')
    .split(',')
    .map((n) => Number(n))
  if (idsStr) {
    idsStr.split(',').forEach((s, idx) => {
      const id = Number(s)
      const q = Math.min(99, Math.max(1, qtyParts[idx] || 1))
      if (Number.isInteger(id) && id > 0) map.set(id, q)
    })
  }
  return map
})

const idsQuery = computed(() => Array.from(parsedPack.value.keys()).join(','))

function syncPackToUrl(map: Map<number, number>) {
  const entries = Array.from(map.entries())
  if (!entries.length) {
    router.replace({ query: {} })
    return
  }
  const hasCustomQty = entries.some(([, q]) => q > 1)
  if (hasCustomQty) {
    const packParam = entries.map(([id, q]) => `${id}:${q}`).join(',')
    router.replace({ query: { pack: packParam } })
  } else {
    router.replace({ query: { ids: entries.map(([id]) => id).join(',') } })
  }
}

function getQty(id: number): number {
  return parsedPack.value.get(id) || 1
}

function changeQty(id: number, delta: number) {
  const next = new Map(parsedPack.value)
  const cur = next.get(id) || 1
  const updated = Math.min(99, Math.max(1, cur + delta))
  next.set(id, updated)
  syncPackToUrl(next)
}

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
  const next = new Map(parsedPack.value)
  if (next.has(id)) {
    next.set(id, Math.min(99, (next.get(id) || 1) + 1))
    searchQuery.value = ''
    isSearchOpen.value = false
    syncPackToUrl(next)
    return
  }
  if (next.size >= 5) {
    alert('Vous pouvez comparer jusqu’à 5 produits simultanément.')
    return
  }
  next.set(id, 1)
  searchQuery.value = ''
  isSearchOpen.value = false
  syncPackToUrl(next)
}

function removeProduct(id: number) {
  const next = new Map(parsedPack.value)
  next.delete(id)
  syncPackToUrl(next)
}

// Duels populaires
const POPULAR_DUELS = [
  { label: 'Modern Horizons 2 vs 3', icon: 'Sparkles', ids: [283, 301], searchA: 'Modern Horizons 2', searchB: 'Modern Horizons 3' },
  { label: 'Kamigawa vs Phyrexia', icon: 'Star', searchA: 'Kamigawa: Neon Dynasty', searchB: 'Phyrexia: All Will Be One' },
  { label: 'Dominaria vs Ravnica Remastered', icon: 'Crown', searchA: 'Dominaria Remastered', searchB: 'Ravnica Remastered' }
]

function launchDuelByName(nameA: string, nameB: string) {
  const pA = allCatalog.value.find((p) => p.name.toLowerCase().includes(nameA.toLowerCase()))
  const pB = allCatalog.value.find((p) => p.name.toLowerCase().includes(nameB.toLowerCase()))
  if (pA && pB) {
    router.push({ query: { ids: `${pA.id},${pB.id}` } })
  }
}

const compareMode = ref<'price' | 'percent' | 'pack'>('price')
const copiedLink = ref(false)

async function copyShareLink() {
  if (typeof window === 'undefined') return
  try {
    await navigator.clipboard.writeText(window.location.href)
    copiedLink.value = true
    setTimeout(() => {
      copiedLink.value = false
    }, 2500)
  } catch {
    // fallback
  }
}

// Résumé du Portefeuille / Pack éphémère
const packSummary = computed(() => {
  if (!products.value.length) return null
  let totalItems = 0
  let totalCurrent = 0
  let totalFirst = 0
  let totalEv = 0
  let totalPriceWithEv = 0

  for (const p of products.value) {
    const q = getQty(p.id)
    totalItems += q
    if (p.currentPrice && p.currentPrice > 0) {
      totalCurrent += p.currentPrice * q
      totalFirst += (p.firstPrice && p.firstPrice > 0 ? p.firstPrice : p.currentPrice) * q
    }
    if (p.lastEv && p.lastEv > 0 && p.currentPrice && p.currentPrice > 0) {
      totalEv += p.lastEv * q
      totalPriceWithEv += p.currentPrice * q
    }
  }

  const gainEur = Math.round((totalCurrent - totalFirst) * 100) / 100
  const gainPct = totalFirst > 0 ? Math.round(((totalCurrent - totalFirst) / totalFirst) * 1000) / 10 : null
  const packEvRatio = totalPriceWithEv > 0 && totalEv > 0 ? Math.round((totalEv / totalPriceWithEv) * 100) : null

  return {
    totalItems,
    totalCurrent: Math.round(totalCurrent * 100) / 100,
    totalEv: totalEv > 0 ? Math.round(totalEv * 100) / 100 : null,
    packEvRatio,
    gainEur,
    gainPct
  }
})

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

  if (compareMode.value === 'pack') {
    const packPoints = labels.map((m) => {
      let sum = 0
      let count = 0
      for (const p of products.value) {
        const q = getQty(p.id)
        const found = p.history.find((h) => h.month === m && h.price > 0)
        if (found) {
          sum += found.price * q
          count++
        }
      }
      return count > 0 ? Math.round(sum * 100) / 100 : null
    })

    return {
      labels,
      datasets: [
        {
          label: `Valeur totale du Pack (${packSummary.value?.totalItems || 0} scellés)`,
          data: packPoints,
          borderColor: '#34d399',
          backgroundColor: 'rgba(52, 211, 153, 0.16)',
          fill: true,
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: '#34d399',
          spanGaps: true
        }
      ]
    }
  }

  const datasets = products.value.map((p, idx) => {
    const color = COLORS[idx % COLORS.length]
    const q = getQty(p.id)
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
      return Math.round(val * q * 100) / 100
    })

    const qtyPrefix = q > 1 ? `${q}x ` : ''
    return {
      label: `${qtyPrefix}${p.name} (${p.category === 'PRECON_DECK' ? (p.deckType || 'Deck') : p.type})`,
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
    <NuxtLink to="/boxes" class="back">
      <Papicon name="ArrowLeft" :size="15" />
      <span>Retour au catalogue des boîtes</span>
    </NuxtLink>

    <section class="hero">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
        <span class="badge" style="background: rgba(99, 144, 240, 0.15); color: #8ab4ff; border: 1px solid rgba(99, 144, 240, 0.3);">
          <Papicon name="Pillar" :size="13" />
          <span>Comparateur Face-à-Face</span>
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
          <label style="display: block; font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; font-weight: 600;">
            Ajouter un produit à la comparaison :
          </label>
          <div class="search-input-wrap" style="max-width: none;">
            <Papicon name="Search" :size="17" class="search-icon" />
            <input
              ref="searchInputRef"
              v-model="searchQuery"
              type="text"
              class="input"
              style="width: 100%;"
              placeholder="Rechercher une boîte, un booster ou un deck (ex: Modern Horizons, Kamigawa, Fallout...)"
              @focus="isSearchOpen = true"
            />
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
              <div style="font-weight: 700; font-size: 0.9rem; color: #34d399;">
                {{ eur(item.price) }}
              </div>
              <button class="btn ghost" style="padding: 4px 10px; font-size: 0.75rem;">
                <Papicon name="Plus" :size="13" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- CHIPS DES PRODUITS SÉLECTIONNÉS AVEC QUANTITÉS -->
      <div v-if="products.length" class="selected-chips">
        <span class="muted" style="font-size: 0.8rem; align-self: center;">Sélection ({{ products.length }}/5) :</span>
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
          <div class="chip-qty-controls">
            <button type="button" class="qty-btn" title="Diminuer la quantité" @click="changeQty(p.id, -1)">−</button>
            <span class="qty-val">{{ getQty(p.id) }}x</span>
            <button type="button" class="qty-btn" title="Augmenter la quantité" @click="changeQty(p.id, 1)">+</button>
          </div>
          <button
            class="chip-remove"
            title="Retirer"
            @click="removeProduct(p.id)"
          >
            <Papicon name="Cross" :size="13" />
          </button>
        </div>

        <button
          type="button"
          class="btn ghost"
          style="margin-left: auto; padding: 5px 12px; font-size: 0.78rem;"
          @click="copyShareLink"
        >
          <Papicon :name="copiedLink ? 'Check' : 'Link'" :size="14" :color="copiedLink ? '#34d399' : 'currentColor'" />
          <span>{{ copiedLink ? 'Lien du pack copié !' : 'Partager ce pack (URL)' }}</span>
        </button>
      </div>
    </div>

    <!-- BILAN DU PORTEFEUILLE / PACK ÉPHÉMÈRE -->
    <section v-if="packSummary && products.length >= 1" class="stats" style="margin-bottom: 0;">
      <div class="card stat">
        <div class="label"><Papicon name="Archive" :size="14" /> <span>Valeur totale du Pack ({{ packSummary.totalItems }} scellé{{ packSummary.totalItems > 1 ? 's' : '' }})</span></div>
        <div class="value" style="color: #34d399;">{{ eur(packSummary.totalCurrent) }}</div>
        <div class="sub">Basé sur les quantités sélectionnées dans l'URL</div>
      </div>
      <div v-if="packSummary.totalEv != null" class="card stat">
        <div class="label"><Papicon name="Sparkles" :size="14" /> <span>EV cumulée du Pack</span></div>
        <div class="value" style="color: #8ab4ff;">{{ eur(packSummary.totalEv) }}</div>
        <div class="sub">Ratio global : {{ packSummary.packEvRatio }} % du prix du pack</div>
      </div>
      <div class="card stat">
        <div class="label"><Papicon name="Pie" :size="14" /> <span>Plus / Moins-value historique</span></div>
        <div class="value" :class="packSummary.gainEur >= 0 ? 'up' : 'down'">
          {{ packSummary.gainEur >= 0 ? '+' : '' }}{{ eur(packSummary.gainEur) }}
        </div>
        <div class="sub">
          {{ packSummary.gainPct != null ? `${packSummary.gainPct >= 0 ? '+' : ''}${packSummary.gainPct} % depuis les premiers relevés` : 'Évolution cumulée' }}
        </div>
      </div>
    </section>

    <!-- ÉTAT VIDE : AUCUN PRODUIT -->
    <div v-if="products.length < 1" class="card empty-compare-card">
      <div class="icon-box" style="width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 16px;">
        <Papicon name="Pillar" :size="28" />
      </div>
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
          <Papicon :name="duel.icon" :size="15" />
          <span>{{ duel.label }}</span>
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
            <button
              class="chip"
              :class="{ active: compareMode === 'pack' }"
              style="padding: 5px 12px; font-size: 0.85rem;"
              @click="compareMode = 'pack'"
            >
              <Papicon name="PiggyBank" :size="14" />
              <span>Courbe cumulée du Pack (€)</span>
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
                      <a :href="p.cardmarket" target="_blank" rel="noopener noreferrer" class="muted" style="text-decoration: underline; display:inline-flex; align-items:center; gap:3px;">
                        <span>Cardmarket</span>
                        <Papicon name="ExternalLink" :size="11" />
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
              <td class="num" style="color: #8ab4ff; font-weight: 600;">
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
              <td class="num" :style="{ color: p.stock && p.stock > 0 ? '#34d399' : 'var(--muted)' }">
                {{ p.stock ?? '-' }}
              </td>
              <td style="text-align: center;">
                <button
                  class="btn ghost"
                  style="padding: 4px 10px; font-size: 0.75rem; border-color: rgba(248, 113, 113, 0.35); color: var(--down);"
                  title="Retirer de la comparaison"
                  @click="removeProduct(p.id)"
                >
                  <Papicon name="Trash" :size="13" />
                  <span>Retirer</span>
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

.chip-qty-controls {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 1px 5px;
}

.qty-btn {
  background: none;
  border: none;
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0 3px;
  line-height: 1;
}

.qty-btn:hover {
  color: var(--text);
}

.qty-val {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--accent-hover);
  min-width: 18px;
  text-align: center;
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
