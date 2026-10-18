<script setup lang="ts">
type Item = {
  id: number; name: string; type: string; releaseDate: string | null; cardmarket: string
  price: number | null; previous: number | null
  var1m: number | null; var3m: number | null; var6m: number | null
}

const { data } = await useFetch<{ month: string | null; items: Item[] }>('/api/products')

const search = ref('')
const type = ref('ALL')
const sortKey = ref<keyof Item>('var1m')
const sortDir = ref<1 | -1>(-1)

const TYPES = [
  { v: 'ALL', l: 'Tous' }, { v: 'DRAFT', l: 'Draft' }, { v: 'SET', l: 'Set' },
  { v: 'PLAY', l: 'Play' }, { v: 'COLLECTOR', l: 'Collector' }, { v: 'OTHER', l: 'Autres' }
]

const items = computed(() => data.value?.items ?? [])

const rows = computed(() => {
  const q = search.value.toLowerCase()
  const list = items.value.filter(
    (i) => i.price != null && (type.value === 'ALL' || i.type === type.value) && i.name.toLowerCase().includes(q)
  )
  const k = sortKey.value
  return [...list].sort((a, b) => {
    const av = a[k] as any, bv = b[k] as any
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'string') return av.localeCompare(bv) * sortDir.value
    return (av - bv) * sortDir.value
  })
})

function sortBy(k: keyof Item) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1
  else { sortKey.value = k; sortDir.value = -1 }
}

const withVar = computed(() => items.value.filter((i) => i.var1m != null))
const best = computed(() => [...withVar.value].sort((a, b) => b.var1m! - a.var1m!)[0])
const worst = computed(() => [...withVar.value].sort((a, b) => a.var1m! - b.var1m!)[0])
const avgVar = computed(() =>
  withVar.value.length ? withVar.value.reduce((s, i) => s + i.var1m!, 0) / withVar.value.length : null
)

const eur = (n: number | null) => n == null ? '-' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
const pct = (n: number | null) => n == null ? '-' : `${n > 0 ? '+' : ''}${n.toFixed(2).replace('.', ',')} %`
const cls = (n: number | null) => n == null ? 'muted' : n > 0 ? 'up' : n < 0 ? 'down' : 'muted'
const year = (d: string | null) => d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-'
const monthLabel = (m: string | null) => m ? new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

useHead({ title: 'MTG Stats : prix des boosters scellés Magic' })
</script>

<template>
  <section class="hero">
    <h1>Prix des boosters scellés</h1>
    <p>
      Suivi mensuel des boîtes de boosters Magic: The Gathering.<span v-if="data?.month"> Données de {{ monthLabel(data.month) }}.</span> Suivez les tendances sur plusieurs mois plutôt que sur un seul relevé.
    </p>
  </section>

  <section class="stats">
    <div class="card stat">
      <div class="label">Variation moyenne (1 mois)</div>
      <div class="value" :class="cls(avgVar)">{{ pct(avgVar) }}</div>
      <div class="sub">{{ withVar.length }} produits comparés</div>
    </div>
    <NuxtLink :to="best ? `/products/${best.id}` : '/'" class="card stat stat-link">
      <div class="label">Plus forte hausse</div>
      <div class="value up">{{ pct(best?.var1m ?? null) }}</div>
      <div class="sub">{{ best?.name ?? '-' }}</div>
    </NuxtLink>
    <NuxtLink :to="worst ? `/products/${worst.id}` : '/'" class="card stat stat-link">
      <div class="label">Plus forte baisse</div>
      <div class="value down">{{ pct(worst?.var1m ?? null) }}</div>
      <div class="sub">{{ worst?.name ?? '-' }}</div>
    </NuxtLink>
  </section>

  <div class="toolbar">
    <input id="search" v-model="search" class="input grow" placeholder="Rechercher une édition..." />
    <div class="chips">
      <button v-for="t in TYPES" :key="t.v" class="chip" :class="{ active: type === t.v }" @click="type = t.v">{{ t.l }}</button>
    </div>
  </div>

  <div class="card table-wrap">
    <table>
      <thead>
        <tr>
          <th @click="sortBy('name')">
            Édition <span v-if="sortKey === 'name'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 110px;" @click="sortBy('type')">
            Type <span v-if="sortKey === 'type'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 105px;" @click="sortBy('releaseDate')">
            Sortie <span v-if="sortKey === 'releaseDate'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 115px;" @click="sortBy('price')">
            Prix <span v-if="sortKey === 'price'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 110px;" @click="sortBy('var1m')">
            1 mois <span v-if="sortKey === 'var1m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 110px;" @click="sortBy('var3m')">
            3 mois <span v-if="sortKey === 'var3m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 110px;" @click="sortBy('var6m')">
            6 mois <span v-if="sortKey === 'var6m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 125px; text-align: center;">Achat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td class="name-cell">
            <NuxtLink class="name" :to="`/products/${r.id}`">{{ r.name }}</NuxtLink>
          </td>
          <td>
            <span class="badge" :class="`badge-${r.type.toLowerCase()}`">{{ r.type }}</span>
          </td>
          <td class="muted">{{ year(r.releaseDate) }}</td>
          <td class="num" style="font-weight: 700; font-size: 0.95rem;">{{ eur(r.price) }}</td>
          <td class="num">
            <span class="tag-var" :class="cls(r.var1m)">{{ pct(r.var1m) }}</span>
          </td>
          <td class="num">
            <span class="tag-var" :class="cls(r.var3m)">{{ pct(r.var3m) }}</span>
          </td>
          <td class="num">
            <span class="tag-var" :class="cls(r.var6m)">{{ pct(r.var6m) }}</span>
          </td>
          <td style="text-align: center;">
            <a class="cm-link" :href="r.cardmarket" target="_blank" rel="noopener noreferrer" :title="`Voir ${r.name} sur Cardmarket`">
              Cardmarket ↗
            </a>
          </td>
        </tr>
        <tr v-if="!rows.length">
          <td colspan="8" class="muted" style="text-align:center; padding:40px;">Aucun résultat</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
