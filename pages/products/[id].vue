<script setup lang="ts">
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const route = useRoute()
const { getIcon } = useSetIcons()

const { data, error } = await useFetch<{
  id: number; name: string; category?: string; type: string; deckType?: string | null
  releaseDate: string | null; standardLegalUntil?: string | null; stock?: number | null; cardmarket: string
  imageUrl?: string | null
  unitComparison?: { id: number; name: string; category: string; type: string; price: number } | null
  history: { month: string; price: number; ev: number | null }[]
}>(`/api/products/${route.params.id}`)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })

const setCode = computed(() => getIcon(data.value?.name ?? '')?.code || null)
const isSecretLair = computed(() =>
  /\bsecret\s+lair\b/i.test(data.value?.name ?? '') ||
  ['sld', 'slc', 'slu'].includes((setCode.value || '').toLowerCase())
)

const chaseCardsUrl = computed(() => {
  const code = setCode.value || 'lookup'
  const params = new URLSearchParams()
  if (data.value?.id) params.set('productId', String(data.value.id))
  if (data.value?.name) params.set('name', data.value.name)
  if (data.value?.type) params.set('type', data.value.type)
  const qs = params.toString()
  return `/api/sets/${code}/top-cards${qs ? `?${qs}` : ''}`
})

const { data: chaseData, pending: loadingChase } = await useFetch<{
  ok: boolean
  setCode: string
  productMode?: 'COLLECTOR' | 'STANDARD'
  cards: {
    id: string
    name: string
    rarity: string
    treatment?: string | null
    collectorNumber?: string | null
    priceEur: number | null
    priceFoilEur: number | null
    imageUrl: string | null
    cardmarketUrl: string | null
    scryfallUrl: string | null
  }[]
}>(chaseCardsUrl, {
  lazy: true,
  server: true,
  immediate: !isSecretLair.value,
  watch: [chaseCardsUrl]
})
const chaseCards = computed(() => (isSecretLair.value ? [] : chaseData.value?.cards || []))
const displaySetCode = computed(() => chaseData.value?.setCode || setCode.value || null)

const timeRange = ref<'6m' | '1y' | '3y' | 'all'>('all')

const timeRanges = [
  { label: '6 mois', value: '6m' },
  { label: '1 an', value: '1y' },
  { label: '3 ans', value: '3y' },
  { label: 'Tout', value: 'all' }
] as const

const filteredHistory = computed(() => {
  const list = data.value?.history ?? []
  if (timeRange.value === 'all' || list.length <= 1) return list
  const lastMonth = list.at(-1)?.month
  if (!lastMonth) return list
  const [y, m] = lastMonth.split('-').map(Number)
  let monthsBack = 6
  if (timeRange.value === '1y') monthsBack = 12
  if (timeRange.value === '3y') monthsBack = 36

  const targetDate = new Date(y, m - 1 - monthsBack, 1)
  const cutoffStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}`
  const filtered = list.filter((h) => h.month >= cutoffStr)
  return filtered.length ? filtered : list
})

const hasEv = computed(() => filteredHistory.value.some((h) => h.ev != null && h.ev > 0))

const chartData = computed(() => ({
  labels: filteredHistory.value.map((h) => h.month),
  datasets: [
    {
      label: data.value?.category === 'PRECON_DECK' ? 'Prix deck' : data.value?.category === 'SINGLE_BOOSTER' ? 'Prix booster' : isBundle.value ? 'Prix bundle' : 'Prix boîte',
      data: filteredHistory.value.map((h) => h.price),
      borderColor: '#5b8def',
      backgroundColor: 'rgba(91, 141, 239, 0.12)',
      fill: true, tension: 0.25, pointRadius: 3, pointBackgroundColor: '#5b8def'
    },
    ...(hasEv.value
      ? [
          {
            label: 'Expected Value (EV)',
            data: filteredHistory.value.map((h) => h.ev),
            borderColor: '#7aa7ff',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            fill: false,
            spanGaps: true,
            tension: 0.25,
            pointRadius: 3,
            pointBackgroundColor: '#7aa7ff'
          }
        ]
      : [])
  ]
}))

const options = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false
  },
  plugins: {
    legend: { display: hasEv.value, labels: { color: '#9a9ca3' } },
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
          const datasetIndex = context.datasetIndex
          const dataIndex = context.dataIndex
          const dataset = context.chart.data.datasets[datasetIndex]
          const label = dataset.label || ''
          if (dataIndex > 0) {
            const prevVal = dataset.data[dataIndex - 1]
            if (prevVal && prevVal > 0) {
              const diff = ((val - prevVal) / prevVal) * 100
              const diffStr = diff > 0 ? `+${diff.toFixed(1)} %` : `${diff.toFixed(1)} %`
              return `${label} : ${val} € (${diffStr} vs mois préc.)`
            }
          }
          return `${label} : ${val} €`
        }
      }
    }
  },
  scales: {
    x: { ticks: { color: '#9a9ca3' }, grid: { color: 'rgba(255,255,255,.05)' } },
    y: { ticks: { color: '#9a9ca3', callback: (v: any) => v + ' €' }, grid: { color: 'rgba(255,255,255,.05)' } }
  }
}

const isVintage = computed(() => data.value?.releaseDate ? new Date(data.value.releaseDate).getFullYear() < 2003 : false)
const isBundle = computed(() => data.value?.type === 'BUNDLE' || /\b(?:bundle|fat\s*pack)\b/i.test(data.value?.name ?? ''))
const canHaveEv = computed(() => data.value?.category !== 'PRECON_DECK' && !isVintage.value)

const first = computed(() => filteredHistory.value[0]?.price)
const last = computed(() => filteredHistory.value.at(-1)?.price)
const rawLastEv = computed(() => (canHaveEv.value ? (filteredHistory.value.at(-1)?.ev ?? null) : null))
const total = computed(() => {
  if (!first.value || !last.value || first.value <= 0 || last.value <= 0) return null
  const diff = ((last.value - first.value) / first.value) * 100
  return diff <= -95 ? null : diff
})
const evRatio = computed(() => {
  if (!canHaveEv.value || rawLastEv.value == null || last.value == null || last.value <= 0) return null
  const ratio = Math.round((rawLastEv.value / last.value) * 100)
  return ratio >= 15 && ratio <= 220 ? ratio : null
})
const lastEv = computed(() => (evRatio.value != null ? rawLastEv.value : null))

// --- SIMULATEUR "OUVRIR OU GARDER SCELLÉ ?" (BREAK-EVEN CALCULATOR) ---
const estimatedPacks = computed(() => {
  const cat = data.value?.category || 'BOOSTER_BOX'
  if (cat === 'PRECON_DECK' || isSecretLair.value) return null
  if (cat === 'SINGLE_BOOSTER') return 1
  if (isBundle.value) {
    return /\bgift\b/i.test(data.value?.name ?? '') ? 10 : 9
  }
  const t = (data.value?.type || '').toUpperCase()
  const name = data.value?.name || ''
  if (t === 'COLLECTOR') {
    return /\b(?:beyond|aftermath|assassin)\b/i.test(name) ? 24 : 12
  }
  if (t === 'SET') {
    return /\b(?:aftermath|assassin)\b/i.test(name) ? 24 : 30
  }
  if (/\b(?:masters|remastered|horizons\s*1|battlebond|conspiracy)\b/i.test(name) && !/\bhorizons\s*[23]\b/i.test(name)) {
    return 24
  }
  return 36
})

const pricePerBooster = computed(() => {
  if (!last.value || !estimatedPacks.value || estimatedPacks.value <= 1) return null
  return Math.round((last.value / estimatedPacks.value) * 100) / 100
})

const boxSavings = computed(() => {
  const unit = data.value?.unitComparison
  if (!unit || !last.value || !estimatedPacks.value) return null
  if (data.value?.category === 'BOOSTER_BOX' && estimatedPacks.value > 1) {
    const totalIfBoughtSingle = Math.round(unit.price * estimatedPacks.value * 100) / 100
    const diffEur = Math.round((totalIfBoughtSingle - last.value) * 100) / 100
    const diffPct = Math.round((diffEur / totalIfBoughtSingle) * 100)
    return {
      mode: 'BOX' as const,
      unitProduct: unit,
      totalSingleCost: totalIfBoughtSingle,
      diffEur,
      diffPct
    }
  }
  if (data.value?.category === 'SINGLE_BOOSTER') {
    const t = (unit.type || '').toUpperCase()
    const boxPacks = t === 'COLLECTOR' ? 12 : t === 'SET' ? 30 : 36
    const boxPerPack = Math.round((unit.price / boxPacks) * 100) / 100
    const diffPerPack = Math.round((last.value - boxPerPack) * 100) / 100
    return {
      mode: 'SINGLE' as const,
      unitProduct: unit,
      boxPacks,
      boxPerPack,
      diffPerPack
    }
  }
  return null
})

const evDelta = computed(() => {
  if (lastEv.value == null || last.value == null || last.value <= 0) return null
  return Math.round((lastEv.value - last.value) * 100) / 100
})

const bestCardPrice = (card: { priceEur: number | null; priceFoilEur: number | null }) => {
  if (chaseData.value?.productMode === 'COLLECTOR' || data.value?.type === 'COLLECTOR') {
    return Math.max(card.priceEur ?? 0, card.priceFoilEur ?? 0)
  }
  return card.priceEur ?? card.priceFoilEur ?? 0
}

const topHitAnalysis = computed(() => {
  if (!chaseCards.value.length || !last.value || last.value <= 0) return null
  const top1 = chaseCards.value[0]
  const top1Val = bestCardPrice(top1)
  if (top1Val <= 0) return null
  const top1CoverPct = Math.min(999, Math.round((top1Val / last.value) * 100))
  const top3Sum = chaseCards.value
    .slice(0, 3)
    .reduce((acc, c) => acc + bestCardPrice(c), 0)
  const hitsNeededAvg = Math.max(1, Math.ceil(last.value / (top3Sum / Math.min(3, chaseCards.value.length))))
  return {
    top1Name: top1.name,
    top1Val: Math.round(top1Val * 100) / 100,
    top1CoverPct,
    top3Sum: Math.round(top3Sum * 100) / 100,
    hitsNeededAvg
  }
})

// Simulateur interactif de tirage éphémère (en mémoire uniquement, 0 stockage navigateur)
const simulatedPullIds = ref<string[]>([])

function toggleSimulatedCard(cardId: string) {
  const idx = simulatedPullIds.value.indexOf(cardId)
  if (idx >= 0) {
    simulatedPullIds.value.splice(idx, 1)
  } else {
    simulatedPullIds.value.push(cardId)
  }
}

function simulateRandomPull() {
  if (!chaseCards.value.length) return
  const count = data.value?.category === 'SINGLE_BOOSTER' ? 1 : Math.min(3, chaseCards.value.length)
  const pool = [...chaseCards.value]
  const picked: string[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    // Pondération réaliste : plus de chance de tirer les cartes #3-#8 que la #1
    const idx = Math.floor(Math.pow(Math.random(), 0.75) * pool.length)
    picked.push(pool[idx].id)
    pool.splice(idx, 1)
  }
  simulatedPullIds.value = picked
}

const simulatedTotal = computed(() => {
  if (!simulatedPullIds.value.length) return 0
  let sum = 0
  for (const id of simulatedPullIds.value) {
    const c = chaseCards.value.find((card) => card.id === id)
    if (c) sum += bestCardPrice(c)
  }
  // Pour une boîte complète, on ajoute un socle estimé de rares/uncommons hors top hits (~30% de l'EV)
  const bulkFloor =
    data.value?.category === 'BOOSTER_BOX' && lastEv.value
      ? Math.round(lastEv.value * 0.35 * 100) / 100
      : 0
  return Math.round((sum + bulkFloor) * 100) / 100
})

const simulatedBulkFloor = computed(() => {
  if (data.value?.category !== 'BOOSTER_BOX' || !lastEv.value || !simulatedPullIds.value.length) return 0
  return Math.round(lastEv.value * 0.35 * 100) / 100
})

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

const lastPrice = computed(() => {
  const history = data.value?.history ?? []
  const p = history.at(-1)?.price ?? null
  return p != null && p > 0 ? p : null
})

const prevPrice = computed(() => {
  const history = data.value?.history ?? []
  const p = history.length >= 2 ? history.at(-2)?.price ?? null : null
  return p != null && p > 0 ? p : null
})

const monthDiff = computed(() => {
  if (lastPrice.value == null || prevPrice.value == null || prevPrice.value <= 0) return null
  const diff = ((lastPrice.value - prevPrice.value) / prevPrice.value) * 100
  return diff <= -95 ? null : diff
})

const pageTitle = computed(() => {
  if (!data.value?.name) return 'Booster | MTG Stats'
  return `${data.value.name} (${data.value.type}) | MTG Stats`
})

const seoDescription = computed(() => {
  if (!data.value) return 'Suivi des prix de boosters scellés Magic: The Gathering sur le marché européen.'
  const parts: string[] = []
  if (data.value.type) parts.push(`Boîte ${data.value.type}`)
  if (lastPrice.value != null) {
    let p = `Dernier prix : ${lastPrice.value} €`
    if (monthDiff.value != null) {
      const sign = monthDiff.value > 0 ? '+' : ''
      p += ` (${sign}${monthDiff.value.toFixed(1)} % sur 1 mois)`
    }
    parts.push(p)
  }
  if (lastEv.value != null) {
    parts.push(`EV : ${lastEv.value} €`)
  }
  parts.push("Historique des prix et tendances de marché sur Cardmarket.")
  return parts.join(' · ')
})

useSeoMeta({
  title: () => pageTitle.value,
  ogTitle: () => pageTitle.value,
  description: () => seoDescription.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => `${siteUrl.value}${route.path}`,
  ogType: 'website'
})
</script>

<template>
  <NuxtLink :to="data?.category === 'PRECON_DECK' ? '/decks' : data?.category === 'SINGLE_BOOSTER' ? '/boosters' : '/boxes'" class="back">
    <Papicon name="ArrowLeft" :size="15" />
    <span>Retour au catalogue</span>
  </NuxtLink>
  <section class="hero product-hero">
    <div v-if="data?.imageUrl" class="product-hero-image-wrap">
      <img
        :src="data.imageUrl.replace('_200w.jpg', '_400w.jpg')"
        :alt="data.name"
        class="product-hero-image"
      />
    </div>
    <div class="product-hero-info">
      <h1 style="display:flex; align-items:center; gap:14px; flex-wrap:wrap;">
        <img
          v-if="getIcon(data?.name ?? '')?.icon"
          :src="getIcon(data?.name ?? '')!.icon"
          :alt="getIcon(data?.name ?? '')!.code"
          :title="getIcon(data?.name ?? '')!.code"
          class="set-icon-large"
        />
        <span>{{ data?.name }}</span>
      </h1>
      <p style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
        <span v-if="data?.category === 'PRECON_DECK'" class="badge" :class="`badge-${(data?.deckType || 'other').toLowerCase()}`">
          {{ data?.deckType || 'DECK' }}
        </span>
        <span v-else-if="isBundle" class="badge badge-bundle">
          Bundle
        </span>
        <span v-else class="badge" :class="`badge-${data?.type.toLowerCase()}`">
          {{ data?.category === 'SINGLE_BOOSTER' ? `Booster ${data?.type}` : `Boîte ${data?.type}` }}
        </span>
        <span v-if="data?.releaseDate" style="display:inline-flex; align-items:center; gap:5px;">
          <Papicon name="Calendar" :size="14" :opacity="0.7" />
          <span>Sorti en {{ new Date(data.releaseDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</span>
        </span>
      </p>
      <div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;">
        <a class="btn" :href="data?.cardmarket" target="_blank" rel="noopener noreferrer">
          <span>Voir sur Cardmarket</span>
          <Papicon name="ExternalLink" :size="14" />
        </a>
        <NuxtLink :to="`/compare?ids=${data?.id}`" class="btn ghost">
          <Papicon name="Pillar" :size="15" />
          <span>Comparer</span>
        </NuxtLink>
      </div>
    </div>
  </section>

  <section class="stats">
    <div class="card stat">
      <div class="label"><Papicon name="PiggyBank" :size="13" /> <span>Prix actuel</span></div>
      <div class="value">{{ last ?? '-' }} €</div>
    </div>
    <div v-if="data?.stock != null" class="card stat">
      <div class="label"><Papicon name="Archive" :size="13" /> <span>Stock disponible</span></div>
      <div class="value" :style="{ color: data.stock > 0 ? '#34d399' : 'var(--muted)' }">{{ data.stock }}</div>
      <div class="sub">{{ data.stock > 0 ? 'En vente sur Cardmarket' : 'Rupture' }}</div>
    </div>
    <div v-if="lastEv != null" class="card stat">
      <div class="label"><Papicon name="Sparkles" :size="13" /> <span>EV estimée</span></div>
      <div class="value" style="color: #8ab4ff;">{{ lastEv }} €</div>
    </div>
    <div v-if="evRatio != null" class="card stat">
      <div class="label"><Papicon name="Coefficient" :size="13" /> <span>Ratio EV / Prix</span></div>
      <div class="value" :class="evRatio >= 100 ? 'up' : 'muted'">{{ evRatio }} %</div>
      <div class="sub" style="display:flex; align-items:center; gap:4px;">
        <template v-if="evRatio >= 100">
          <Papicon name="Sparkles" :size="13" color="#34d399" />
          <span class="up">Rentable à l'ouverture</span>
        </template>
        <span v-else>Sous l'EV</span>
      </div>
    </div>
    <div class="card stat">
      <div class="label"><Papicon name="Pie" :size="13" /> <span>Évolution ({{ timeRange === 'all' ? 'totale' : timeRanges.find(r => r.value === timeRange)?.label }})</span></div>
      <div class="value" :class="total == null ? 'muted' : total >= 0 ? 'up' : 'down'">
        {{ total == null ? '-' : (total > 0 ? '+' : '') + total.toFixed(1).replace('.', ',') + ' %' }}
      </div>
      <div class="sub">Relevé initial : {{ first ?? '-' }} €</div>
    </div>
  </section>

  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
      <h3 style="margin:0; display:flex; align-items:center; gap:8px;">
        <Papicon name="Pie" :size="18" color="var(--accent-hover)" />
        <span>Historique des prix</span>
      </h3>
      <div class="chips">
        <button
          v-for="r in timeRanges"
          :key="r.value"
          class="chip"
          :class="{ active: timeRange === r.value }"
          style="padding: 5px 12px; font-size: 0.8rem;"
          @click="timeRange = r.value"
        >
          {{ r.label }}
        </button>
      </div>
    </div>
    <div class="chart-box"><ClientOnly><Line :data="chartData" :options="options" /></ClientOnly></div>
  </div>

  <!-- SIMULATEUR : OUVRIR OU GARDER SCELLÉ ? (BREAK-EVEN CALCULATOR) -->
  <section
    v-if="!isSecretLair && data?.category !== 'PRECON_DECK' && (lastEv != null || pricePerBooster != null || topHitAnalysis != null)"
    class="card breakeven-card"
    style="margin-top: 24px;"
  >
    <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
      <div>
        <h3 style="margin:0 0 4px 0; display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span class="icon-box" style="width: 30px; height: 30px; border-radius: 9px;">
            <Papicon name="Pillar" :size="16" />
          </span>
          <span>Simulateur : Ouvrir ou Garder Scellé ?</span>
          <span
            v-if="evRatio != null"
            class="badge"
            :style="{
              background: evRatio >= 100 ? 'rgba(52, 211, 153, 0.16)' : evRatio >= 75 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(248, 113, 113, 0.15)',
              color: evRatio >= 100 ? '#34d399' : evRatio >= 75 ? '#fbbf24' : '#f87171',
              borderColor: evRatio >= 100 ? 'rgba(52, 211, 153, 0.35)' : evRatio >= 75 ? 'rgba(251, 191, 36, 0.35)' : 'rgba(248, 113, 113, 0.35)'
            }"
          >
            {{
              evRatio >= 100
                ? 'Ouverture statistiquement rentable'
                : evRatio >= 75
                  ? 'Équilibre ouverture / collection'
                  : 'Prime au scellé (garder scellé)'
            }}
          </span>
        </h3>
        <p class="muted" style="margin:0; font-size:0.85rem;">
          Analyse du seuil de rentabilité (Break-Even), coût de revient par booster et impact des cartes maîtresses.
        </p>
      </div>
      <button
        v-if="chaseCards.length"
        class="btn ghost"
        style="font-size:0.8rem; padding:7px 13px;"
        @click="simulateRandomPull"
      >
        <Papicon name="Sparkles" :size="14" />
        <span>{{ simulatedPullIds.length ? 'Relancer un tirage simulé' : 'Simuler un tirage aléatoire' }}</span>
      </button>
    </div>

    <div class="breakeven-grid">
      <!-- 1. Bilan EV vs Prix Scellé -->
      <div v-if="lastEv != null && last != null" class="breakeven-box">
        <div class="breakeven-box-title">
          <Papicon name="Coefficient" :size="14" />
          <span>Espérance de gain / perte à l'ouverture</span>
        </div>
        <div class="breakeven-main-val" :class="evDelta != null && evDelta >= 0 ? 'up' : 'down'">
          {{ evDelta != null ? (evDelta >= 0 ? `+${evDelta}` : `${evDelta}`) + ' €' : '-' }}
        </div>
        <div class="breakeven-bar-track" title="Ratio EV / Prix scellé">
          <div
            class="breakeven-bar-fill"
            :style="{
              width: `${Math.min(100, Math.max(8, evRatio || 0))}%`,
              background: (evRatio || 0) >= 100 ? 'linear-gradient(90deg, #34d399, #10b981)' : 'linear-gradient(90deg, #6390f0, #8ab4ff)'
            }"
          />
        </div>
        <div class="muted" style="font-size: 0.78rem; margin-top: 6px;">
          L'EV couvre <strong>{{ evRatio }} %</strong> du prix d'achat ({{ lastEv }} € de contenu moyen pour {{ last }} €).
        </div>
      </div>

      <!-- 2. Coût par booster & Comparaison unité -->
      <div v-if="pricePerBooster != null || boxSavings != null" class="breakeven-box">
        <div class="breakeven-box-title">
          <Papicon name="Archive" :size="14" />
          <span>{{ data?.category === 'SINGLE_BOOSTER' ? 'Comparaison avec la boîte complète' : `Coût de revient (${estimatedPacks} boosters)` }}</span>
        </div>
        <template v-if="pricePerBooster != null">
          <div class="breakeven-main-val" style="color: var(--text);">
            {{ pricePerBooster.toFixed(2).replace('.', ',') }} €
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--muted);">/ booster</span>
          </div>
          <div v-if="boxSavings?.mode === 'BOX'" class="muted" style="font-size: 0.78rem; margin-top: 6px;">
            Booster à l'unité (<NuxtLink :to="`/products/${boxSavings.unitProduct.id}`" style="color: var(--accent-hover); text-decoration: underline;">{{ boxSavings.unitProduct.price }} €</NuxtLink>) :
            <strong :class="boxSavings.diffEur >= 0 ? 'up' : 'down'">
              {{ boxSavings.diffEur >= 0 ? `vous économisez ${boxSavings.diffEur} € (-${boxSavings.diffPct} %)` : `+${Math.abs(boxSavings.diffEur)} € plus cher qu'à l'unité` }}
            </strong>
            en prenant la boîte.
          </div>
          <div v-else class="muted" style="font-size: 0.78rem; margin-top: 6px;">
            Basé sur une contenance standard de <strong>{{ estimatedPacks }} boosters</strong> par {{ isBundle ? 'bundle' : 'boîte' }}.
          </div>
        </template>
        <template v-else-if="boxSavings?.mode === 'SINGLE'">
          <div class="breakeven-main-val" style="color: var(--text);">
            {{ boxSavings.boxPerPack.toFixed(2).replace('.', ',') }} €
            <span style="font-size: 0.8rem; font-weight: 500; color: var(--muted);">/ booster en boîte</span>
          </div>
          <div class="muted" style="font-size: 0.78rem; margin-top: 6px;">
            En achetant la <NuxtLink :to="`/products/${boxSavings.unitProduct.id}`" style="color: var(--accent-hover); text-decoration: underline;">boîte complète ({{ boxSavings.unitProduct.price }} €)</NuxtLink>, chaque booster revient
            <strong :class="boxSavings.diffPerPack >= 0 ? 'up' : 'down'">
              {{ boxSavings.diffPerPack >= 0 ? `${boxSavings.diffPerPack.toFixed(2).replace('.', ',')} € moins cher` : `${Math.abs(boxSavings.diffPerPack).toFixed(2).replace('.', ',')} € plus cher` }}
            </strong>.
          </div>
        </template>
      </div>

      <!-- 3. Seuil de rentabilité par les Hits (Top Chase Cards) -->
      <div v-if="topHitAnalysis != null" class="breakeven-box">
        <div class="breakeven-box-title">
          <Papicon name="Crown" :size="14" />
          <span>Poids du Hit #1 sur le prix</span>
        </div>
        <div class="breakeven-main-val" style="color: #fbbf24;">
          {{ topHitAnalysis.top1CoverPct }} %
          <span style="font-size: 0.8rem; font-weight: 500; color: var(--muted);">remboursés en 1 carte</span>
        </div>
        <div class="muted" style="font-size: 0.78rem; margin-top: 6px;">
          Tirer <strong>{{ topHitAnalysis.top1Name }}</strong> ({{ topHitAnalysis.top1Val }} €) couvre {{ topHitAnalysis.top1CoverPct }} % du scellé. Il faut environ <strong>{{ topHitAnalysis.hitsNeededAvg }} hit(s) majeur(s)</strong> du Top 3 pour atteindre le Break-Even.
        </div>
      </div>
    </div>

    <!-- Bandeau de simulation de tirage en direct -->
    <div v-if="simulatedPullIds.length && last != null" class="sim-pull-banner">
      <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
        <span class="icon-box" style="width: 32px; height: 32px; border-radius: 9px; background: rgba(52, 211, 153, 0.14); color: #34d399;">
          <Papicon name="Sparkles" :size="16" />
        </span>
        <div>
          <div style="font-weight: 700; font-size: 0.92rem;">
            Tirage simulé ({{ simulatedPullIds.length }} hit{{ simulatedPullIds.length > 1 ? 's' : '' }} sélectionné{{ simulatedPullIds.length > 1 ? 's' : '' }}<span v-if="simulatedBulkFloor > 0"> + {{ simulatedBulkFloor }} € de fonds de boîte estimé</span>) :
            <span :class="simulatedTotal >= last ? 'up' : 'down'" style="font-family: 'Outfit', sans-serif; font-size: 1.1rem; margin-left: 6px;">
              {{ simulatedTotal.toFixed(2).replace('.', ',') }} €
            </span>
          </div>
          <div class="muted" style="font-size: 0.78rem;">
            Bilan face au prix d'achat ({{ last }} €) :
            <strong :class="simulatedTotal >= last ? 'up' : 'down'">
              {{ simulatedTotal >= last ? `+${(simulatedTotal - last).toFixed(2).replace('.', ',')} € (Boîte rentabilisée !)` : `${(simulatedTotal - last).toFixed(2).replace('.', ',')} € (Encore ${(last - simulatedTotal).toFixed(2).replace('.', ',')} € pour rembourser)` }}
            </strong>
            · <em>Cliquez sur les cartes maîtresses ci-dessous pour ajuster votre tirage.</em>
          </div>
        </div>
      </div>
      <button class="btn ghost" style="padding: 5px 10px; font-size: 0.75rem;" @click="simulatedPullIds = []">
        <Papicon name="Cross" :size="12" />
        <span>Réinitialiser</span>
      </button>
    </div>
  </section>

  <!-- CARTES MAÎTRESSES DU SET (CHASE CARDS SCRYFALL) -->
  <section v-if="!isSecretLair && (loadingChase || chaseCards.length)" class="card" style="margin-top: 24px;">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
      <div>
        <h3 style="margin: 0 0 4px 0; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <span class="icon-box" style="width: 30px; height: 30px; border-radius: 9px;">
            <Papicon :name="chaseData?.productMode === 'COLLECTOR' || data?.type === 'COLLECTOR' ? 'Sparkles' : 'Card'" :size="16" />
          </span>
          <span>
            {{
              chaseData?.productMode === 'COLLECTOR' || data?.type === 'COLLECTOR'
                ? 'Cartes maîtresses — Boosters Collector (Chase Cards)'
                : 'Cartes maîtresses — Boosters Standard (Chase Cards)'
            }}
          </span>
          <span v-if="displaySetCode" class="badge" style="background: rgba(99, 144, 240, 0.15); color: #8ab4ff;">{{ displaySetCode }}</span>
          <span
            v-if="chaseData?.productMode === 'COLLECTOR' || data?.type === 'COLLECTOR'"
            class="badge badge-collector"
            style="font-size: 0.7rem;"
          >
            Variants &amp; Foils Collector inclus
          </span>
        </h3>
        <p class="muted" style="margin: 0; font-size: 0.85rem;">
          {{
            chaseData?.productMode === 'COLLECTOR' || data?.type === 'COLLECTOR'
              ? 'Les cartes et traitements spéciaux (Extended Art, Borderless, Showcase, Surge/Textured Foil) les plus chers disponibles dans les boosters Collector.'
              : 'Les cartes les plus recherchées ouvrables dans ces boosters standard (hors variantes exclusives aux boîtes Collector).'
          }}
        </p>
      </div>
      <span class="muted" style="font-size: 0.75rem;">Source : Scryfall API</span>
    </div>

    <div v-if="loadingChase" class="muted" style="text-align: center; padding: 30px;">
      Chargement des cartes maîtresses...
    </div>

    <div v-else class="chase-cards-grid">
      <div
        v-for="card in chaseCards"
        :key="card.id"
        class="chase-card-item"
        :class="{ 'is-simulated': simulatedPullIds.includes(card.id) }"
      >
        <div class="chase-card-img-wrap">
          <a
            :href="card.scryfallUrl || card.cardmarketUrl || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="chase-card-img-link"
            :title="`Voir ${card.name} sur Scryfall`"
          >
            <img
              v-if="card.imageUrl"
              :src="card.imageUrl"
              :alt="card.name"
              class="chase-card-img"
              loading="lazy"
            />
          </a>
          <button
            v-if="last != null && data?.category !== 'PRECON_DECK'"
            type="button"
            class="sim-card-toggle"
            :class="{ active: simulatedPullIds.includes(card.id) }"
            :title="simulatedPullIds.includes(card.id) ? 'Retirer du tirage simulé' : 'Simuler ce hit dans mon ouverture'"
            @click="toggleSimulatedCard(card.id)"
          >
            <Papicon :name="simulatedPullIds.includes(card.id) ? 'Check' : 'Plus'" :size="12" />
          </button>
        </div>
        <div class="chase-card-info">
          <a
            :href="card.scryfallUrl || card.cardmarketUrl || '#'"
            target="_blank"
            rel="noopener noreferrer"
            class="chase-card-name"
            :title="card.name"
          >
            {{ card.name }}
          </a>
          <div v-if="card.treatment" style="margin: 1px 0 2px;">
            <span class="badge" style="font-size: 0.62rem; padding: 1px 5px; background: rgba(178, 102, 255, 0.16); color: #c996ff; border: 1px solid rgba(178, 102, 255, 0.35);">
              {{ card.treatment }}
            </span>
          </div>
          <div class="chase-card-meta">
            <span v-if="card.priceEur != null" class="chase-card-price">
              {{ card.priceEur }} €
            </span>
            <span v-if="card.priceFoilEur != null" class="chase-card-foil" title="Prix Foil" style="display:inline-flex; align-items:center; gap:3px;">
              <Papicon name="Sparkles" :size="11" />
              <span>{{ card.priceFoilEur }} €</span>
            </span>
            <span v-if="card.priceEur == null && card.priceFoilEur == null" class="muted" style="font-size: 0.72rem;">
              Prix N/C
            </span>
            <span class="badge" :class="`badge-rarity-${card.rarity}`" style="font-size: 0.65rem; padding: 2px 6px;">
              {{ card.rarity === 'mythic' ? 'Mythique' : card.rarity === 'rare' ? 'Rare' : card.rarity }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-hero {
  display: flex;
  align-items: center;
  gap: 28px;
  flex-wrap: wrap;
}

.product-hero-image-wrap {
  flex-shrink: 0;
  width: 140px;
  height: 140px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition: transform .2s ease;
}

.product-hero-image-wrap:hover {
  transform: scale(1.05);
  border-color: var(--accent);
}

.product-hero-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.product-hero-info {
  flex: 1;
  min-width: 260px;
}

/* Chase Cards Grid */
.chase-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 14px;
}

.chase-card-item {
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: all .2s ease;
}

.chase-card-item:hover {
  transform: translateY(-4px);
  border-color: var(--accent);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.chase-card-img-link {
  display: block;
  aspect-ratio: 5 / 7;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.3);
}

.chase-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform .25s ease;
}

.chase-card-item:hover .chase-card-img {
  transform: scale(1.04);
}

.chase-card-info {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.chase-card-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
}

.chase-card-name:hover {
  color: var(--accent);
}

.chase-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: auto;
}

.chase-card-price {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4cb782;
}

.chase-card-foil {
  font-size: 0.72rem;
  color: #e5a93b;
  font-weight: 600;
}

.badge-rarity-mythic {
  background: rgba(245, 166, 35, 0.15);
  color: #f5a623;
  border: 1px solid rgba(245, 166, 35, 0.3);
}

.badge-rarity-rare {
  background: rgba(229, 192, 123, 0.15);
  color: #e5c07b;
  border: 1px solid rgba(229, 192, 123, 0.3);
}

/* Break-Even Simulator */
.breakeven-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.breakeven-box {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 15px 16px;
  display: flex;
  flex-direction: column;
}

.breakeven-box-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 8px;
}

.breakeven-main-val {
  font-family: 'Outfit', sans-serif;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.breakeven-bar-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 999px;
  overflow: hidden;
  margin-top: 10px;
}

.breakeven-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.35s ease;
}

.sim-pull-banner {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: rgba(99, 144, 240, 0.08);
  border: 1px solid rgba(99, 144, 240, 0.28);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.chase-card-img-wrap {
  position: relative;
}

.chase-card-item.is-simulated {
  border-color: #34d399;
  box-shadow: 0 0 0 1px rgba(52, 211, 153, 0.4), 0 8px 20px rgba(0, 0, 0, 0.45);
}

.sim-card-toggle {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 26px;
  height: 26px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(11, 13, 18, 0.78);
  backdrop-filter: blur(6px);
  color: var(--text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s ease;
}

.sim-card-toggle:hover {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}

.sim-card-toggle.active {
  background: #34d399;
  border-color: #34d399;
  color: #06281e;
}
</style>
