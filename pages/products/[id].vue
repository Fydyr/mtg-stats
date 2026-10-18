<script setup lang="ts">
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler } from 'chart.js'
import { Line } from 'vue-chartjs'

Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Filler)

const route = useRoute()
const { data, error } = await useFetch<{
  id: number; name: string; type: string; releaseDate: string | null; cardmarket: string
  history: { month: string; price: number }[]
}>(`/api/products/${route.params.id}`)

if (error.value) throw createError({ statusCode: 404, statusMessage: 'Produit introuvable', fatal: true })

const chartData = computed(() => ({
  labels: data.value!.history.map((h) => h.month),
  datasets: [{
    data: data.value!.history.map((h) => h.price),
    borderColor: '#5b8def',
    backgroundColor: 'rgba(91, 141, 239, 0.12)',
    fill: true, tension: 0.25, pointRadius: 3, pointBackgroundColor: '#5b8def'
  }]
}))

const options = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#9a9ca3' }, grid: { color: 'rgba(255,255,255,.05)' } },
    y: { ticks: { color: '#9a9ca3', callback: (v: any) => v + ' €' }, grid: { color: 'rgba(255,255,255,.05)' } }
  }
}

const first = computed(() => data.value!.history[0]?.price)
const last = computed(() => data.value!.history.at(-1)?.price)
const total = computed(() => first.value && last.value ? ((last.value - first.value) / first.value) * 100 : null)

useHead({ title: `${data.value?.name} | MTG Stats` })
</script>

<template>
  <NuxtLink to="/" class="back">← Retour aux boosters</NuxtLink>
  <section class="hero">
    <h1>{{ data?.name }}</h1>
    <p><span class="badge">{{ data?.type }}</span>
      <span v-if="data?.releaseDate"> · sorti en {{ new Date(data.releaseDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) }}</span></p>
    <p style="margin-top:14px"><a class="btn" :href="data?.cardmarket" target="_blank" rel="noopener noreferrer">Voir sur Cardmarket</a></p>
  </section>

  <section class="stats">
    <div class="card stat"><div class="label">Prix actuel</div><div class="value">{{ last ?? '-' }} €</div></div>
    <div class="card stat"><div class="label">Premier relevé</div><div class="value">{{ first ?? '-' }} €</div></div>
    <div class="card stat">
      <div class="label">Évolution totale</div>
      <div class="value" :class="total == null ? 'muted' : total >= 0 ? 'up' : 'down'">
        {{ total == null ? '-' : (total > 0 ? '+' : '') + total.toFixed(1).replace('.', ',') + ' %' }}
      </div>
    </div>
  </section>

  <div class="card">
    <h3>Historique des prix</h3>
    <div class="chart-box"><ClientOnly><Line :data="chartData" :options="options" /></ClientOnly></div>
  </div>
</template>
