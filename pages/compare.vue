<script setup lang="ts">
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from 'chart.js'
import { Line } from 'vue-chartjs'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const route = useRoute()
const router = useRouter()
const { getIcon } = useSetIcons()

const idsQuery = computed(() => String(route.query.ids || ''))

const { data, error } = await useFetch<{
  products: {
    id: number
    name: string
    type: string
    releaseDate: string | null
    cardmarket: string
    history: { month: string; price: number; ev: number | null }[]
  }[]
}>(() => `/api/products/compare?ids=${idsQuery.value}`, {
  watch: [idsQuery]
})

if (error.value) {
  throw createError({ statusCode: 500, statusMessage: 'Erreur lors de la comparaison', fatal: true })
}

const products = computed(() => data.value?.products ?? [])

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
      monthsSet.add(h.month)
    }
  }
  return Array.from(monthsSet).sort()
})

const chartData = computed(() => {
  const labels = allMonths.value

  const datasets = products.value.map((p, idx) => {
    const color = COLORS[idx % COLORS.length]
    const priceMap = new Map(p.history.map((h) => [h.month, h.price]))

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
      label: `${p.name} (${p.type})`,
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
      labels: { color: '#e6e7ea', padding: 16 }
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

function removeProduct(id: number) {
  const currentIds = idsQuery.value.split(',').map(Number).filter((n) => n !== id)
  if (currentIds.length) {
    router.push({ query: { ids: currentIds.join(',') } })
  } else {
    router.push('/')
  }
}

const eur = (n: number | null | undefined) =>
  n == null
    ? '-'
    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

useHead({ title: 'Comparateur de boîtes de boosters | MTG Stats' })
</script>

<template>
  <NuxtLink to="/" class="back">← Retour au catalogue des boosters</NuxtLink>

  <section class="hero">
    <h1>Comparateur de boîtes</h1>
    <p>
      Comparez les trajectoires de prix et les performances relatives de plusieurs boîtes de boosters Magic sur la même période.
    </p>
  </section>

  <div v-if="products.length < 2" class="card" style="text-align: center; padding: 48px 24px; margin-top: 24px;">
    <p class="muted" style="font-size: 1.1rem; margin-bottom: 20px;">
      Veuillez sélectionner au moins 2 boîtes pour afficher une comparaison.
    </p>
    <NuxtLink to="/" class="btn">Choisir des boîtes à comparer</NuxtLink>
  </div>

  <div v-else>
    <!-- Graphique Comparatif -->
    <div class="card" style="margin-top: 24px;">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
        <h3 style="margin: 0;">Évolution comparée</h3>
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

    <!-- Tableau Comparatif -->
    <div class="card table-wrap" style="margin-top: 24px;">
      <table>
        <thead>
          <tr>
            <th>Édition</th>
            <th>Type</th>
            <th>Date sortie</th>
            <th class="num">Prix actuel</th>
            <th class="num">Premier relevé</th>
            <th class="num">Évolution totale</th>
            <th class="num">Dernière EV</th>
            <th style="text-align: center;">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(p, idx) in products" :key="p.id">
            <td class="name-cell">
              <div class="name-with-icon">
                <span
                  style="display: inline-block; width: 10px; height: 10px; border-radius: 50%;"
                  :style="{ backgroundColor: COLORS[idx % COLORS.length].border }"
                />
                <img
                  v-if="getIcon(p.name)?.icon"
                  :src="getIcon(p.name)!.icon"
                  :alt="getIcon(p.name)!.code"
                  class="set-icon"
                />
                <NuxtLink class="name" :to="`/products/${p.id}`">{{ p.name }}</NuxtLink>
              </div>
            </td>
            <td>
              <span class="badge" :class="`badge-${p.type.toLowerCase()}`">{{ p.type }}</span>
            </td>
            <td class="muted">
              {{ p.releaseDate ? new Date(p.releaseDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-' }}
            </td>
            <td class="num" style="font-weight: 700;">
              {{ eur(p.history.at(-1)?.price) }}
            </td>
            <td class="num muted">
              {{ eur(p.history[0]?.price) }}
            </td>
            <td class="num">
              <span
                v-if="p.history[0]?.price && p.history.at(-1)?.price"
                class="tag-var"
                :class="(p.history.at(-1)!.price - p.history[0].price) >= 0 ? 'up' : 'down'"
              >
                {{ (p.history.at(-1)!.price - p.history[0].price) >= 0 ? '+' : '' }}
                {{ (((p.history.at(-1)!.price - p.history[0].price) / p.history[0].price) * 100).toFixed(1) }} %
              </span>
              <span v-else class="muted">-</span>
            </td>
            <td class="num" style="color: #7aa7ff; font-weight: 600;">
              {{ eur(p.history.at(-1)?.ev) }}
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
</template>
