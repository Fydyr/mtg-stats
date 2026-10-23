<script setup lang="ts">
type MarketItem = {
  id: number
  name: string
  type: string
  releaseDate: string | null
  cardmarket: string
  price: number
  ev: number | null
  evRatio: number | null
  var1m: number | null
  var3m: number | null
  var6m: number | null
}

const { data } = await useFetch<{
  month: string | null
  marketTrend: {
    totalProducts: number
    avgPrice: number
    avgVar1m: number
    avgVar3m: number
    avgVar6m: number
  } | null
  byType: {
    type: string
    count: number
    avgPrice: number | null
    avgVar1m: number | null
    avgVar3m: number | null
  }[]
  topGainers: MarketItem[]
  topLosers: MarketItem[]
  topEv: MarketItem[]
}>('/api/market/stats')

const { getIcon } = useSetIcons()

const activeTab = ref<'gainers' | 'losers' | 'ev'>('gainers')

const eur = (n: number | null | undefined) =>
  n == null
    ? '-'
    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

const pct = (n: number | null | undefined) =>
  n == null ? '-' : `${n > 0 ? '+' : ''}${n.toFixed(2).replace('.', ',')} %`

const cls = (n: number | null | undefined) => (n == null ? 'muted' : n > 0 ? 'up' : n < 0 ? 'down' : 'muted')

const monthLabel = (m: string | null | undefined) =>
  m ? new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

const seoDescription = computed(() => {
  const m = data.value?.month ? `Relevé de ${monthLabel(data.value.month)}. ` : ''
  const count = data.value?.marketTrend?.totalProducts
  const countStr = count ? `Analyse de ${count} boîtes de boosters Magic: The Gathering` : 'Analyse macro-économique du marché des boosters Magic'
  return `${countStr}. ${m}Tendances globales, tops hausses, baisses et ratios EV sur le marché européen.`
})

useSeoMeta({
  title: 'Tendances du marché scellé | MTG Stats',
  ogTitle: 'Tendances du marché scellé | MTG Stats',
  description: () => seoDescription.value,
  ogDescription: () => seoDescription.value,
  ogUrl: () => `${siteUrl.value}/market`,
  ogType: 'website'
})
</script>

<template>
  <section class="hero">
    <h1>Tendances du Marché Scellé</h1>
    <p>
      Analyse macro-économique du marché européen des boîtes de boosters Magic: The Gathering.<span v-if="data?.month"> Relevé de {{ monthLabel(data.month) }}.</span>
    </p>
  </section>

  <!-- CARTES MACRO DU MARCHÉ -->
  <section class="stats">
    <div class="card stat">
      <div class="label">Prix moyen d'une boîte</div>
      <div class="value" style="color: var(--accent);">{{ eur(data?.marketTrend?.avgPrice) }}</div>
      <div class="sub">{{ data?.marketTrend?.totalProducts }} boîtes actives suivies</div>
    </div>
    <div class="card stat">
      <div class="label">Tendance marché (1 mois)</div>
      <div class="value" :class="cls(data?.marketTrend?.avgVar1m)">
        {{ pct(data?.marketTrend?.avgVar1m) }}
      </div>
      <div class="sub">Variation globale mensuelle</div>
    </div>
    <div class="card stat">
      <div class="label">Tendance marché (3 mois)</div>
      <div class="value" :class="cls(data?.marketTrend?.avgVar3m)">
        {{ pct(data?.marketTrend?.avgVar3m) }}
      </div>
      <div class="sub">Variation moyenne trimestrielle</div>
    </div>
    <div class="card stat">
      <div class="label">Tendance marché (6 mois)</div>
      <div class="value" :class="cls(data?.marketTrend?.avgVar6m)">
        {{ pct(data?.marketTrend?.avgVar6m) }}
      </div>
      <div class="sub">Variation sur 6 mois</div>
    </div>
  </section>

  <!-- PERFORMANCE PAR TYPE DE BOÎTE -->
  <div class="card" style="margin-bottom: 28px;">
    <h3 style="margin-bottom: 16px;">Performance par catégorie de booster</h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
      <div
        v-for="cat in data?.byType ?? []"
        :key="cat.type"
        style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 8px; padding: 14px;"
      >
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span class="badge" :class="`badge-${cat.type.toLowerCase()}`">{{ cat.type }}</span>
          <span class="muted" style="font-size: 0.75rem;">{{ cat.count }} boîtes</span>
        </div>
        <div style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px;">
          {{ eur(cat.avgPrice) }}
          <span style="font-size: 0.75rem; color: var(--muted); font-weight: 400;">(moy.)</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
          <span class="muted">1 mois :</span>
          <span class="tag-var" :class="cls(cat.avgVar1m)">{{ pct(cat.avgVar1m) }}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-top: 4px;">
          <span class="muted">3 mois :</span>
          <span class="tag-var" :class="cls(cat.avgVar3m)">{{ pct(cat.avgVar3m) }}</span>
        </div>
      </div>
    </div>
  </div>

  <!-- PALMARÈS TOP 10 (MOVERS & SHAKERS) -->
  <div class="card">
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
      <h3 style="margin: 0;">Palmarès du mois (Top 10)</h3>
      <div class="chips">
        <button
          class="chip"
          :class="{ active: activeTab === 'gainers' }"
          @click="activeTab = 'gainers'"
        >
          🚀 Plus fortes hausses
        </button>
        <button
          class="chip"
          :class="{ active: activeTab === 'losers' }"
          @click="activeTab = 'losers'"
        >
          📉 Plus fortes baisses
        </button>
        <button
          class="chip"
          :class="{ active: activeTab === 'ev' }"
          @click="activeTab = 'ev'"
        >
          ⚡ Meilleures opportunités EV
        </button>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width: 40px; text-align: center;">#</th>
            <th>Édition</th>
            <th>Type</th>
            <th class="num">Prix actuel</th>
            <th class="num">EV estimée</th>
            <th class="num">Ratio EV/Prix</th>
            <th class="num">1 mois</th>
            <th class="num">3 mois</th>
            <th style="width: 110px; text-align: center;">Détails</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in (activeTab === 'gainers' ? data?.topGainers : activeTab === 'losers' ? data?.topLosers : data?.topEv) ?? []"
            :key="item.id"
          >
            <td style="text-align: center; font-weight: 700; color: var(--muted); font-size: 0.85rem;">
              {{ index + 1 }}
            </td>
            <td class="name-cell">
              <div class="name-with-icon">
                <img
                  v-if="getIcon(item.name)?.icon"
                  :src="getIcon(item.name)!.icon"
                  :alt="getIcon(item.name)!.code"
                  class="set-icon"
                />
                <NuxtLink class="name" :to="`/products/${item.id}`">{{ item.name }}</NuxtLink>
              </div>
            </td>
            <td>
              <span class="badge" :class="`badge-${item.type.toLowerCase()}`">{{ item.type }}</span>
            </td>
            <td class="num" style="font-weight: 700;">{{ eur(item.price) }}</td>
            <td class="num" style="color: #7aa7ff; font-weight: 600;">{{ eur(item.ev) }}</td>
            <td class="num">
              <span
                v-if="item.evRatio != null"
                class="tag-var"
                :class="item.evRatio >= 100 ? 'up' : 'muted'"
              >
                {{ item.evRatio }} %
              </span>
              <span v-else class="muted">-</span>
            </td>
            <td class="num">
              <span class="tag-var" :class="cls(item.var1m)">{{ pct(item.var1m) }}</span>
            </td>
            <td class="num">
              <span class="tag-var" :class="cls(item.var3m)">{{ pct(item.var3m) }}</span>
            </td>
            <td style="text-align: center;">
              <NuxtLink :to="`/products/${item.id}`" class="btn ghost" style="padding: 4px 10px; font-size: 0.78rem;">
                Voir
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
