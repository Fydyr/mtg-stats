<script setup lang="ts">
type Item = {
  id: number; name: string; type: string; releaseDate: string | null; cardmarket: string
  price: number | null; ev: number | null; previous: number | null
  var1m: number | null; var3m: number | null; var6m: number | null
  evRatio?: number | null
}

const { data } = await useFetch<{ month: string | null; items: Item[] }>('/api/products')
const { getIcon } = useSetIcons()

const search = ref('')
const type = ref('ALL')
const onlyProfitable = ref(false)
const viewMode = ref<'table' | 'grid'>('table')
const sortKey = ref<keyof Item>('var1m')
const sortDir = ref<1 | -1>(-1)
const selectedIds = ref<number[]>([])

function toggleSelect(id: number) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    if (selectedIds.value.length >= 5) return
    selectedIds.value.push(id)
  }
}

const TYPES = [
  { v: 'ALL', l: 'Tous' }, { v: 'DRAFT', l: 'Draft' }, { v: 'SET', l: 'Set' },
  { v: 'PLAY', l: 'Play' }, { v: 'COLLECTOR', l: 'Collector' }, { v: 'OTHER', l: 'Autres' }
]

const items = computed(() => {
  return (data.value?.items ?? []).map((i) => ({
    ...i,
    evRatio: (i.ev != null && i.price != null && i.price > 0) ? Math.round((i.ev / i.price) * 100) : null
  }))
})

const rows = computed(() => {
  const q = search.value.toLowerCase()
  const list = items.value.filter(
    (i) => i.price != null
      && (type.value === 'ALL' || i.type === type.value)
      && i.name.toLowerCase().includes(q)
      && (!onlyProfitable.value || (i.evRatio != null && i.evRatio >= 100))
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

const selectedTypeLabel = computed(() => {
  const found = TYPES.find((t) => t.v === type.value)
  return found && found.v !== 'ALL' ? found.l : null
})

// Produits de la catégorie sélectionnée
const categoryItems = computed(() => {
  if (type.value === 'ALL') return items.value
  return items.value.filter((i) => i.type === type.value)
})

const withVar = computed(() => categoryItems.value.filter((i) => i.var1m != null))
const best = computed(() => [...withVar.value].sort((a, b) => b.var1m! - a.var1m!)[0])
const worst = computed(() => [...withVar.value].sort((a, b) => a.var1m! - b.var1m!)[0])
const avgVar = computed(() =>
  withVar.value.length ? withVar.value.reduce((s, i) => s + i.var1m!, 0) / withVar.value.length : null
)

const withEvRatio = computed(() => categoryItems.value.filter((i) => i.evRatio != null))
const bestEv = computed(() => [...withEvRatio.value].sort((a, b) => b.evRatio! - a.evRatio!)[0])
const profitableCount = computed(() => categoryItems.value.filter((i) => i.evRatio != null && i.evRatio >= 100).length)

const eur = (n: number | null) => n == null ? '-' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
const pct = (n: number | null) => n == null ? '-' : `${n > 0 ? '+' : ''}${n.toFixed(2).replace('.', ',')} %`
const cls = (n: number | null) => n == null ? 'muted' : n > 0 ? 'up' : n < 0 ? 'down' : 'muted'
const year = (d: string | null) => d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '-'
const monthLabel = (m: string | null) => m ? new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

function exportCsv() {
  const headers = ['ID', 'Edition', 'Type', 'Date de sortie', 'Prix (EUR)', 'EV (EUR)', 'Ratio EV (%)', 'Var 1m (%)', 'Var 3m (%)', 'Var 6m (%)', 'Cardmarket']
  const escapeCell = (str: any) => `"${String(str ?? '').replace(/"/g, '""')}"`

  const csvRows = [headers.join(';')]
  for (const r of rows.value) {
    csvRows.push([
      r.id,
      escapeCell(r.name),
      r.type,
      r.releaseDate ? r.releaseDate.slice(0, 10) : '',
      r.price ?? '',
      r.ev ?? '',
      r.evRatio ?? '',
      r.var1m != null ? r.var1m.toFixed(2) : '',
      r.var3m != null ? r.var3m.toFixed(2) : '',
      r.var6m != null ? r.var6m.toFixed(2) : '',
      escapeCell(r.cardmarket)
    ].join(';'))
  }

  const blob = new Blob(['\ufeff' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mtg-stats-${data.value?.month || 'export'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'MTG Stats : prix des boosters scellés Magic',
  ogTitle: 'MTG Stats : prix des boosters scellés Magic',
  description: 'Suivi mensuel des prix des boîtes de boosters Magic: The Gathering sur le marché européen : variations, historique et tendances.',
  ogDescription: 'Suivi mensuel des prix des boîtes de boosters Magic: The Gathering sur le marché européen : variations, historique et tendances.',
  ogUrl: () => `${siteUrl.value}/`,
  ogType: 'website'
})
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
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Variation moyenne (1 mois)</span>
        <span v-if="selectedTypeLabel" class="badge" :class="`badge-${type.toLowerCase()}`" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value" :class="cls(avgVar)">{{ pct(avgVar) }}</div>
      <div class="sub">{{ withVar.length }} boîte(s) comparée(s)</div>
    </div>
    <NuxtLink :to="best ? `/products/${best.id}` : '#'" class="card stat stat-link">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Plus forte hausse</span>
        <span v-if="selectedTypeLabel" class="badge" :class="`badge-${type.toLowerCase()}`" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value up">{{ pct(best?.var1m ?? null) }}</div>
      <div class="sub">{{ best?.name ?? '-' }}</div>
    </NuxtLink>
    <NuxtLink :to="worst ? `/products/${worst.id}` : '#'" class="card stat stat-link">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Plus forte baisse</span>
        <span v-if="selectedTypeLabel" class="badge" :class="`badge-${type.toLowerCase()}`" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value down">{{ pct(worst?.var1m ?? null) }}</div>
      <div class="sub">{{ worst?.name ?? '-' }}</div>
    </NuxtLink>
    <NuxtLink :to="bestEv ? `/products/${bestEv.id}` : '#'" class="card stat stat-link">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Meilleur ratio EV/Prix</span>
        <span v-if="selectedTypeLabel" class="badge" :class="`badge-${type.toLowerCase()}`" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value" :class="bestEv && bestEv.evRatio && bestEv.evRatio >= 100 ? 'up' : 'muted'">
        {{ bestEv?.evRatio != null ? `${bestEv.evRatio} %` : '-' }}
      </div>
      <div class="sub">{{ bestEv?.name ?? '-' }}</div>
    </NuxtLink>
  </section>

  <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
    <input id="search" v-model="search" class="input grow" placeholder="Rechercher une édition..." />
    <div class="chips">
      <button v-for="t in TYPES" :key="t.v" class="chip" :class="{ active: type === t.v }" @click="type = t.v">{{ t.l }}</button>
      <button
        class="chip"
        :class="{ active: onlyProfitable }"
        style="display: inline-flex; align-items: center; gap: 6px;"
        title="Afficher uniquement les boîtes dont l'EV (Expected Value) dépasse le prix d'achat"
        @click="onlyProfitable = !onlyProfitable"
      >
        <span>⚡ EV &gt; Prix</span>
        <span v-if="profitableCount > 0" class="badge" style="background: rgba(76, 183, 130, 0.2); color: #4cb782; padding: 1px 6px; font-size: 0.7rem;">{{ profitableCount }}</span>
      </button>
    </div>
    <div class="chips">
      <button
        class="chip"
        style="padding: 7px 12px;"
        title="Exporter la liste affichée au format CSV (compatible Excel)"
        @click="exportCsv"
      >
        📥 Export CSV
      </button>
      <button
        class="chip"
        :class="{ active: viewMode === 'table' }"
        style="padding: 7px 12px;"
        title="Affichage en tableau"
        @click="viewMode = 'table'"
      >
        ☷ Tableau
      </button>
      <button
        class="chip"
        :class="{ active: viewMode === 'grid' }"
        style="padding: 7px 12px;"
        title="Affichage en grille de cartes"
        @click="viewMode = 'grid'"
      >
        ⊞ Grille
      </button>
    </div>
  </div>

  <!-- VUE TABLEAU -->
  <div v-if="viewMode === 'table'" class="card table-wrap">
    <table>
      <thead>
        <tr>
          <th class="checkbox-cell" style="width: 36px;"></th>
          <th @click="sortBy('name')">
            Édition <span v-if="sortKey === 'name'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 110px;" @click="sortBy('type')">
            Type <span v-if="sortKey === 'type'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 125px;" @click="sortBy('releaseDate')">
            Date de sortie <span v-if="sortKey === 'releaseDate'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('price')">
            Prix <span v-if="sortKey === 'price'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('ev')">
            EV <span v-if="sortKey === 'ev'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('evRatio')">
            Ratio EV <span v-if="sortKey === 'evRatio'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('var1m')">
            1 mois <span v-if="sortKey === 'var1m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('var3m')">
            3 mois <span v-if="sortKey === 'var3m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('var6m')">
            6 mois <span v-if="sortKey === 'var6m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 125px; text-align: center;">Achat</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in rows" :key="r.id">
          <td class="checkbox-cell" @click.stop>
            <input
              type="checkbox"
              class="custom-checkbox"
              :checked="selectedIds.includes(r.id)"
              :disabled="!selectedIds.includes(r.id) && selectedIds.length >= 5"
              title="Sélectionner pour comparer"
              @change="toggleSelect(r.id)"
            />
          </td>
          <td class="name-cell">
            <div class="name-with-icon">
              <img
                v-if="getIcon(r.name)?.icon"
                :src="getIcon(r.name)!.icon"
                :title="getIcon(r.name)!.code"
                :alt="getIcon(r.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <NuxtLink class="name" :to="`/products/${r.id}`">{{ r.name }}</NuxtLink>
            </div>
          </td>
          <td>
            <span class="badge" :class="`badge-${r.type.toLowerCase()}`">{{ r.type }}</span>
          </td>
          <td class="muted">{{ year(r.releaseDate) }}</td>
          <td class="num" style="font-weight: 700; font-size: 0.95rem;">{{ eur(r.price) }}</td>
          <td class="num" style="font-weight: 600; color: #7aa7ff;">{{ eur(r.ev) }}</td>
          <td class="num">
            <span
              v-if="r.evRatio != null"
              class="tag-var"
              :class="r.evRatio >= 100 ? 'up' : 'muted'"
              :title="r.evRatio >= 100 ? 'Rentable à l\'ouverture (EV > Prix)' : 'Sous l\'EV'"
            >
              {{ r.evRatio }} %
            </span>
            <span v-else class="muted">-</span>
          </td>
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
          <td colspan="11" class="muted" style="text-align:center; padding:40px;">Aucun résultat</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- VUE GRILLE DE CARTES -->
  <div v-else class="cards-grid">
    <div v-for="r in rows" :key="r.id" class="product-card">
      <div>
        <div class="product-card-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <input
              type="checkbox"
              class="custom-checkbox"
              :checked="selectedIds.includes(r.id)"
              :disabled="!selectedIds.includes(r.id) && selectedIds.length >= 5"
              title="Sélectionner pour comparer"
              @change="toggleSelect(r.id)"
            />
            <img
              v-if="getIcon(r.name)?.icon"
              :src="getIcon(r.name)!.icon"
              :title="getIcon(r.name)!.code"
              :alt="getIcon(r.name)!.code"
              class="set-icon"
              loading="lazy"
            />
            <span class="badge" :class="`badge-${r.type.toLowerCase()}`">{{ r.type }}</span>
          </div>
          <span class="muted" style="font-size:0.75rem;">{{ year(r.releaseDate) }}</span>
        </div>
        <NuxtLink class="product-card-title" :to="`/products/${r.id}`">{{ r.name }}</NuxtLink>
      </div>

      <div class="product-card-body">
        <div class="product-card-price-row">
          <div>
            <span style="font-size:0.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; display:block;">Prix boîte</span>
            <span class="product-card-price">{{ eur(r.price) }}</span>
          </div>
          <div style="text-align:right;">
            <span style="font-size:0.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; display:block;">1 mois</span>
            <span class="tag-var" :class="cls(r.var1m)">{{ pct(r.var1m) }}</span>
          </div>
        </div>

        <div class="product-card-extra">
          <span>EV : <strong style="color: #7aa7ff;">{{ eur(r.ev) }}</strong></span>
          <span>
            Ratio :
            <span
              v-if="r.evRatio != null"
              class="tag-var"
              :class="r.evRatio >= 100 ? 'up' : 'muted'"
              style="font-size:0.75rem; padding:1px 5px;"
            >
              {{ r.evRatio }} %
            </span>
            <span v-else class="muted">-</span>
          </span>
        </div>

        <div class="product-card-footer">
          <NuxtLink :to="`/products/${r.id}`" class="btn ghost" style="padding:5px 12px; font-size:0.8rem;">
            Graphique
          </NuxtLink>
          <a class="cm-link" :href="r.cardmarket" target="_blank" rel="noopener noreferrer">
            Cardmarket ↗
          </a>
        </div>
      </div>
    </div>
    <div v-if="!rows.length" class="card muted" style="grid-column: 1 / -1; text-align:center; padding:40px;">
      Aucun résultat
    </div>
  </div>

  <!-- BARRE FLOTTANTE DE COMPARAISON -->
  <div v-if="selectedIds.length > 0" class="compare-bar">
    <div class="compare-bar-content">
      <span>
        <strong>{{ selectedIds.length }}</strong> boîte(s) sélectionnée(s)
        <span class="muted" style="font-size:0.8rem; margin-left:6px;">(max 5)</span>
      </span>
      <div style="display:flex; gap:8px;">
        <button class="btn ghost" style="padding:6px 12px; font-size:0.85rem;" @click="selectedIds = []">
          Effacer
        </button>
        <NuxtLink
          :to="`/compare?ids=${selectedIds.join(',')}`"
          class="btn"
          :class="{ disabled: selectedIds.length < 2 }"
          style="padding:6px 16px; font-size:0.85rem;"
        >
          Comparer 📊
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
