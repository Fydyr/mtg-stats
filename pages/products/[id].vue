<script setup lang="ts">
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const route = useRoute()
const { data, error } = await useFetch<{
  id: number; name: string; category?: string; type: string; deckType?: string | null
  releaseDate: string | null; standardLegalUntil?: string | null; stock?: number | null; cardmarket: string
  imageUrl?: string | null
  history: { month: string; price: number; ev: number | null }[]
}>(`/api/products/${route.params.id}`)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })

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
      label: data.value?.category === 'PRECON_DECK' ? 'Prix deck' : data.value?.category === 'SINGLE_BOOSTER' ? 'Prix booster' : 'Prix boîte',
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
const isBox = computed(() => data.value?.category === 'BOOSTER_BOX' && (data.value?.type === 'DRAFT' || data.value?.type === 'PLAY' || data.value?.type === 'SET'))

const first = computed(() => filteredHistory.value[0]?.price)
const last = computed(() => filteredHistory.value.at(-1)?.price)
const lastEv = computed(() => (isBox.value && !isVintage.value) ? filteredHistory.value.at(-1)?.ev : null)
const total = computed(() => {
  if (!first.value || !last.value || first.value <= 0 || last.value <= 0) return null
  const diff = ((last.value - first.value) / first.value) * 100
  return diff <= -95 ? null : diff
})
const evRatio = computed(() => {
  if (!isBox.value || isVintage.value || lastEv.value == null || last.value == null || last.value <= 0) return null
  const ratio = Math.round((lastEv.value / last.value) * 100)
  return ratio >= 15 && ratio <= 250 ? ratio : null
})

const { getIcon } = useSetIcons()

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
  <NuxtLink :to="data?.category === 'PRECON_DECK' ? '/decks' : data?.category === 'SINGLE_BOOSTER' ? '/boosters' : '/boxes'" class="back">← Retour au catalogue</NuxtLink>
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
      <p>
        <span v-if="data?.category === 'PRECON_DECK'" class="badge" :class="`badge-${(data?.deckType || 'other').toLowerCase()}`">
          {{ data?.deckType || 'DECK' }}
        </span>
        <span v-else class="badge" :class="`badge-${data?.type.toLowerCase()}`">
          {{ data?.category === 'SINGLE_BOOSTER' ? `Booster ${data?.type}` : `Boîte ${data?.type}` }}
        </span>
        <span v-if="data?.releaseDate"> · sorti en {{ new Date(data.releaseDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</span>
      </p>
      <p style="margin-top:14px"><a class="btn" :href="data?.cardmarket" target="_blank" rel="noopener noreferrer">Voir sur Cardmarket ↗</a></p>
    </div>
  </section>

  <section class="stats">
    <div class="card stat"><div class="label">Prix actuel</div><div class="value">{{ last ?? '-' }} €</div></div>
    <div v-if="data?.stock != null" class="card stat">
      <div class="label">Stock disponible</div>
      <div class="value" :style="{ color: data.stock > 0 ? '#4cb782' : 'var(--muted)' }">{{ data.stock }}</div>
      <div class="sub">{{ data.stock > 0 ? 'En vente sur Cardmarket' : 'Rupture' }}</div>
    </div>
    <div v-if="lastEv != null" class="card stat">
      <div class="label">EV estimée</div>
      <div class="value" style="color: #7aa7ff;">{{ lastEv }} €</div>
    </div>
    <div v-if="evRatio != null" class="card stat">
      <div class="label">Ratio EV / Prix</div>
      <div class="value" :class="evRatio >= 100 ? 'up' : 'muted'">{{ evRatio }} %</div>
      <div class="sub">{{ evRatio >= 100 ? '⚡ Rentable à l\'ouverture' : 'Sous l\'EV' }}</div>
    </div>
    <div class="card stat">
      <div class="label">Évolution ({{ timeRange === 'all' ? 'totale' : timeRanges.find(r => r.value === timeRange)?.label }})</div>
      <div class="value" :class="total == null ? 'muted' : total >= 0 ? 'up' : 'down'">
        {{ total == null ? '-' : (total > 0 ? '+' : '') + total.toFixed(1).replace('.', ',') + ' %' }}
      </div>
      <div class="sub">Relevé initial : {{ first ?? '-' }} €</div>
    </div>
  </section>

  <div class="card">
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
      <h3 style="margin:0;">Historique des prix</h3>
      <div class="chips">
        <button
          v-for="r in timeRanges"
          :key="r.value"
          class="chip"
          :class="{ active: timeRange === r.value }"
          style="padding: 4px 10px; font-size: 0.8rem;"
          @click="timeRange = r.value"
        >
          {{ r.label }}
        </button>
      </div>
    </div>
    <div class="chart-box"><ClientOnly><Line :data="chartData" :options="options" /></ClientOnly></div>
  </div>
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
</style>
