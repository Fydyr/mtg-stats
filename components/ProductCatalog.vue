<script setup lang="ts">
type Item = {
  id: number
  name: string
  category: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'
  type: string
  deckType?: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER' | null
  releaseDate: string | null
  standardLegalUntil?: string | null
  stock?: number | null
  cardmarket: string
  imageUrl?: string | null
  price: number | null
  ev: number | null
  previous: number | null
  var1m: number | null
  var3m: number | null
  var6m: number | null
  evRatio?: number | null
}

const props = defineProps<{
  category: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'
}>()

const { data } = await useFetch<{ month: string | null; items: Item[] }>('/api/products')
const { getIcon } = useSetIcons()

const search = ref('')
const type = ref('ALL')
const deckType = ref('ALL')
const era = ref('ALL')
const priceRange = ref('ALL')
const onlyProfitable = ref(false)
const viewMode = ref<'table' | 'grid'>('table')
const sortKey = ref<keyof Item>('releaseDate')
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
  { v: 'ALL', l: 'Tous les types' },
  { v: 'DRAFT', l: 'Draft' },
  { v: 'SET', l: 'Set' },
  { v: 'PLAY', l: 'Play' },
  { v: 'COLLECTOR', l: 'Collector' },
  { v: 'OTHER', l: 'Autres' }
]

const DECK_TYPES = [
  { v: 'ALL', l: 'Tous les decks' },
  { v: 'COMMANDER', l: 'Commander' },
  { v: 'CHALLENGER', l: 'Challenger' },
  { v: 'STARTER', l: 'Starter / Kits' },
  { v: 'OTHER', l: 'Autres' }
]

const currentYear = new Date().getFullYear()
const standardCutoffYear = currentYear - 3

const ERAS = [
  { v: 'ALL', l: 'Toutes les ères', title: 'Toutes les extensions' },
  { v: 'STANDARD', l: 'Standard', title: 'Format Standard (en cours & configuré)' },
  { v: 'PIONEER', l: 'Pioneer', title: 'Format Pioneer (depuis 2012)' },
  { v: 'MODERN', l: 'Modern', title: 'Format Modern (2003-2012)' },
  { v: 'VINTAGE', l: 'Vintage', title: 'Format Vintage (< 2003)' },
  { v: 'MASTERS', l: 'Masters & Horizons', title: 'Séries Masters, Horizons et Remastered' }
] as const

const PRICE_RANGES = [
  { v: 'ALL', l: 'Tous les prix' },
  { v: 'UNDER_100', l: '< 100 €' },
  { v: '100_250', l: '100 - 250 €' },
  { v: '250_500', l: '250 - 500 €' },
  { v: 'OVER_500', l: '> 500 €' }
] as const

function matchesEra(item: Item, eraVal: string): boolean {
  if (eraVal === 'ALL') return true
  const lowerName = item.name.toLowerCase()
  const isMasters = lowerName.includes('masters') || lowerName.includes('horizons') || lowerName.includes('remastered')
  if (eraVal === 'MASTERS') return isMasters

  // Détermination de la légalité Standard :
  // 1. Si standardLegalUntil est renseigné (ex: configuré dans l'admin pour Foundations jusqu'en 2029)
  // 2. Sinon, règle par défaut : sorties des 3 dernières années, hors Masters
  const isCurrentlyStandard = item.standardLegalUntil
    ? new Date() <= new Date(item.standardLegalUntil)
    : !item.releaseDate
      ? true
      : (new Date(item.releaseDate).getFullYear() >= standardCutoffYear && !isMasters)

  if (eraVal === 'STANDARD') return isCurrentlyStandard

  if (!item.releaseDate) return true
  const y = new Date(item.releaseDate).getFullYear()

  if (eraVal === 'PIONEER') return y >= 2012 && !isCurrentlyStandard && !isMasters
  if (eraVal === 'MODERN') return y >= 2003 && y < 2012 && !isMasters
  if (eraVal === 'VINTAGE') return y < 2003
  return true
}

function matchesPriceRange(price: number | null, rangeVal: string): boolean {
  if (rangeVal === 'ALL') return true
  if (price == null) return false
  if (rangeVal === 'UNDER_100') return price < 100
  if (rangeVal === '100_250') return price >= 100 && price <= 250
  if (rangeVal === '250_500') return price > 250 && price <= 500
  if (rangeVal === 'OVER_500') return price > 500
  return true
}

const items = computed(() => {
  return (data.value?.items ?? []).map((i) => {
    const isVintage = i.releaseDate ? new Date(i.releaseDate).getFullYear() < 2003 : false
    const rawEvRatio = (i.ev != null && i.price != null && i.price > 0 && !isVintage)
      ? Math.round((i.ev / i.price) * 100)
      : null
    // L'ouverture d'une boîte est réaliste entre 15% et 250% (au-delà, anomalie de données)
    const evRatio = (rawEvRatio != null && rawEvRatio >= 15 && rawEvRatio <= 250) ? rawEvRatio : null

    // Si le prix est <= 0 ou la variation <= -95% (bug d'import à 0€), on assainit les valeurs
    const price = (i.price != null && i.price > 0) ? i.price : null
    const var1m = (i.var1m != null && i.var1m > -95 && price != null) ? i.var1m : null

    return {
      ...i,
      price,
      var1m,
      category: (i.category || 'BOOSTER_BOX') as 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK',
      evRatio
    }
  })
})

const rows = computed(() => {
  const q = search.value.toLowerCase()
  const list = items.value.filter((i) => {
    if (i.price == null || i.price <= 0) return false
    if (i.var1m != null && i.var1m <= -95) return false
    if (i.category !== props.category) return false
    if (!i.name.toLowerCase().includes(q)) return false

    // Filtres généraux (Ère, Tranches de prix)
    if (!matchesEra(i, era.value)) return false
    if (!matchesPriceRange(i.price, priceRange.value)) return false

    if (props.category === 'PRECON_DECK') {
      if (deckType.value !== 'ALL' && (i.deckType || 'OTHER') !== deckType.value) return false
    } else {
      if (type.value !== 'ALL' && i.type !== type.value) return false
      if (onlyProfitable.value && (i.evRatio == null || i.evRatio < 100)) return false
    }
    return true
  })
  const k = sortKey.value
  return [...list].sort((a, b) => {
    const av = a[k] as any, bv = b[k] as any
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (k === 'releaseDate') {
      const ta = new Date(av).getTime()
      const tb = new Date(bv).getTime()
      if (isNaN(ta) && isNaN(tb)) return 0
      if (isNaN(ta)) return 1
      if (isNaN(tb)) return -1
      return (ta - tb) * sortDir.value
    }
    if (typeof av === 'string') return av.localeCompare(bv) * sortDir.value
    return (av - bv) * sortDir.value
  })
})

function sortBy(k: keyof Item) {
  if (sortKey.value === k) sortDir.value = (sortDir.value * -1) as 1 | -1
  else { sortKey.value = k; sortDir.value = -1 }
}

const selectedTypeLabel = computed(() => {
  if (props.category === 'PRECON_DECK') {
    const found = DECK_TYPES.find((t) => t.v === deckType.value)
    return found && found.v !== 'ALL' ? found.l : null
  }
  const found = TYPES.find((t) => t.v === type.value)
  return found && found.v !== 'ALL' ? found.l : null
})

const categoryItems = computed(() => {
  return items.value.filter((i) => {
    if (i.price == null || i.price <= 0) return false
    if (i.category !== props.category) return false
    if (props.category === 'PRECON_DECK') {
      return deckType.value === 'ALL' || (i.deckType || 'OTHER') === deckType.value
    } else {
      return type.value === 'ALL' || i.type === type.value
    }
  })
})

const withVar = computed(() => categoryItems.value.filter((i) => i.var1m != null && i.var1m > -95 && i.price != null && i.price > 0))
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
  const headers = ['ID', 'Produit', 'Categorie', 'Type / Sous-type', 'Date de sortie', 'Prix (EUR)', 'EV (EUR)', 'Ratio EV (%)', 'Var 1m (%)', 'Var 3m (%)', 'Var 6m (%)', 'Cardmarket']
  const escapeCell = (str: any) => `"${String(str ?? '').replace(/"/g, '""')}"`

  const csvRows = [headers.join(';')]
  for (const r of rows.value) {
    csvRows.push([
      r.id,
      escapeCell(r.name),
      r.category,
      r.category === 'PRECON_DECK' ? (r.deckType || 'OTHER') : r.type,
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
  a.download = `mtg-stats-${props.category.toLowerCase()}-${data.value?.month || 'export'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    viewMode.value = 'grid'
  }
})
</script>

<template>
  <section class="hero">
    <h1>
      {{
        category === 'PRECON_DECK'
          ? 'Prix des decks préconstruits'
          : category === 'SINGLE_BOOSTER'
          ? 'Prix des boosters individuels'
          : 'Prix des boîtes de boosters'
      }}
    </h1>
    <p>
      {{
        category === 'PRECON_DECK'
          ? 'Suivi de la cote des decks préconstruits Magic: The Gathering (Commander, Challenger, Starter sets).'
          : category === 'SINGLE_BOOSTER'
          ? 'Suivi des prix des boosters à l\'unité Magic: The Gathering (Draft, Set, Play, Collector).'
          : 'Suivi mensuel des boîtes de boosters scellées Magic: The Gathering (marché européen).'
      }}
      <span v-if="data?.month"> Relevé de {{ monthLabel(data.month) }}.</span>
    </p>
  </section>

  <section class="stats">
    <div class="card stat">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Variation moyenne (1 mois)</span>
        <span v-if="selectedTypeLabel" class="badge badge-other" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value" :class="cls(avgVar)">{{ pct(avgVar) }}</div>
      <div class="sub">{{ withVar.length }} produit(s) comparé(s)</div>
    </div>
    <NuxtLink :to="best ? `/products/${best.id}` : '#'" class="card stat stat-link">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Plus forte hausse</span>
        <span v-if="selectedTypeLabel" class="badge badge-other" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value up">{{ pct(best?.var1m ?? null) }}</div>
      <div class="sub">{{ best?.name ?? '-' }}</div>
    </NuxtLink>
    <NuxtLink :to="worst ? `/products/${worst.id}` : '#'" class="card stat stat-link">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Plus forte baisse</span>
        <span v-if="selectedTypeLabel" class="badge badge-other" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value down">{{ pct(worst?.var1m ?? null) }}</div>
      <div class="sub">{{ worst?.name ?? '-' }}</div>
    </NuxtLink>
    <NuxtLink :to="bestEv ? `/products/${bestEv.id}` : '#'" class="card stat stat-link">
      <div class="label" style="display:flex; align-items:center; justify-content:space-between;">
        <span>Meilleur ratio EV/Prix</span>
        <span v-if="selectedTypeLabel" class="badge badge-other" style="font-size:0.65rem;">{{ selectedTypeLabel }}</span>
      </div>
      <div class="value" :class="bestEv && bestEv.evRatio && bestEv.evRatio >= 100 ? 'up' : 'muted'">
        {{ bestEv?.evRatio != null ? `${bestEv.evRatio} %` : '-' }}
      </div>
      <div class="sub">{{ bestEv?.name ?? '-' }}</div>
    </NuxtLink>
  </section>

  <!-- BARRE D'OUTILS ET FILTRES -->
  <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap;">
    <input
      id="search"
      v-model="search"
      class="input grow"
      :placeholder="category === 'PRECON_DECK' ? 'Rechercher un deck préconstruit...' : 'Rechercher une édition...'"
    />

    <!-- FILTRES POUR LES DECKS PRÉCONSTRUITS -->
    <div v-if="category === 'PRECON_DECK'" class="chips">
      <button
        v-for="t in DECK_TYPES"
        :key="t.v"
        class="chip"
        :class="{ active: deckType === t.v }"
        @click="deckType = t.v"
      >
        {{ t.l }}
      </button>
    </div>

    <!-- FILTRES POUR LES BOÎTES ET BOOSTERS -->
    <div v-else class="chips">
      <button v-for="t in TYPES" :key="t.v" class="chip" :class="{ active: type === t.v }" @click="type = t.v">{{ t.l }}</button>
      <button
        v-if="category === 'BOOSTER_BOX'"
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

  <!-- FILTRES AVANCÉS (Ères, Tranches de prix) -->
  <div class="advanced-filters card">
    <div class="filter-group">
      <span class="filter-group-label">Ère / Format :</span>
      <div class="chips filter-chips">
        <button
          v-for="e in ERAS"
          :key="e.v"
          class="chip filter-sm"
          :class="{ active: era === e.v }"
          :title="e.title"
          @click="era = e.v"
        >
          {{ e.l }}
        </button>
      </div>
    </div>

    <div class="filter-group">
      <span class="filter-group-label">Tranche de prix :</span>
      <div class="chips filter-chips">
        <button
          v-for="p in PRICE_RANGES"
          :key="p.v"
          class="chip filter-sm"
          :class="{ active: priceRange === p.v }"
          @click="priceRange = p.v"
        >
          {{ p.l }}
        </button>
      </div>
    </div>
  </div>

  <!-- VUE TABLEAU -->
  <div v-if="viewMode === 'table'" class="mobile-table-hint muted">↔ Faites glisser le tableau horizontalement pour voir toutes les colonnes</div>
  <div v-if="viewMode === 'table'" class="card table-wrap">
    <table>
      <thead>
        <tr>
          <th class="checkbox-cell" style="width: 36px;"></th>
          <th style="width: 48px; text-align: center;">Visuel</th>
          <th @click="sortBy('name')">
            {{ category === 'PRECON_DECK' ? 'Deck / Produit' : 'Édition' }}
            <span v-if="sortKey === 'name'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 125px;" @click="sortBy(category === 'PRECON_DECK' ? 'deckType' : 'type')">
            {{ category === 'PRECON_DECK' ? 'Catégorie' : 'Type' }}
            <span v-if="sortKey === 'type' || sortKey === 'deckType'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 125px;" @click="sortBy('releaseDate')">
            Date de sortie <span v-if="sortKey === 'releaseDate'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('price')">
            Prix <span v-if="sortKey === 'price'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 85px;" @click="sortBy('stock')">
            Stock <span v-if="sortKey === 'stock'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('ev')">
            EV <span v-if="sortKey === 'ev'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 105px;" @click="sortBy('evRatio')">
            Ratio EV <span v-if="sortKey === 'evRatio'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 95px;" @click="sortBy('var1m')">
            1 mois <span v-if="sortKey === 'var1m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 95px;" @click="sortBy('var3m')">
            3 mois <span v-if="sortKey === 'var3m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th class="num" style="width: 95px;" @click="sortBy('var6m')">
            6 mois <span v-if="sortKey === 'var6m'" style="font-size:0.65rem; color:var(--accent);">{{ sortDir === 1 ? '▲' : '▼' }}</span>
          </th>
          <th style="width: 110px; text-align: center;">Cardmarket</th>
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
          <!-- VISUEL MINIATURE -->
          <td style="text-align: center; padding: 6px 8px;">
            <div class="row-thumb-wrap">
              <img
                v-if="r.imageUrl"
                :src="r.imageUrl"
                :alt="r.name"
                class="row-thumb"
                loading="lazy"
              />
              <img
                v-else-if="getIcon(r.name)?.icon"
                :src="getIcon(r.name)!.icon"
                :alt="getIcon(r.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <span v-else class="muted" style="font-size: 0.75rem;">📦</span>
            </div>
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
            <span v-if="r.category === 'PRECON_DECK'" class="badge" :class="`badge-${(r.deckType || 'other').toLowerCase()}`">
              {{ r.deckType || 'DECK' }}
            </span>
            <span v-else class="badge" :class="`badge-${r.type.toLowerCase()}`">{{ r.type }}</span>
          </td>
          <td class="muted">{{ year(r.releaseDate) }}</td>
          <td class="num" style="font-weight: 700; font-size: 0.95rem;">{{ eur(r.price) }}</td>
          <td class="num" style="font-size: 0.85rem; font-weight: 600;">
            <span v-if="r.stock != null" :style="{ color: r.stock > 0 ? '#4cb782' : 'var(--muted)' }">
              {{ r.stock }}
            </span>
            <span v-else class="muted">-</span>
          </td>
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
          <td colspan="13" class="muted" style="text-align:center; padding:40px;">Aucun résultat pour ces filtres</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- VUE GRILLE DE CARTES -->
  <div v-else class="cards-grid">
    <div v-for="r in rows" :key="r.id" class="product-card">
      <!-- IMAGE VISUEL GRILLE -->
      <NuxtLink :to="`/products/${r.id}`" class="product-card-image-box">
        <img
          v-if="r.imageUrl"
          :src="r.imageUrl"
          :alt="r.name"
          class="product-card-cover"
          loading="lazy"
        />
        <div v-else class="product-card-placeholder">
          <img
            v-if="getIcon(r.name)?.icon"
            :src="getIcon(r.name)!.icon"
            :alt="getIcon(r.name)!.code"
            class="set-icon-large"
            loading="lazy"
          />
          <span v-else style="font-size: 2rem;">📦</span>
        </div>
      </NuxtLink>

      <div class="product-card-main">
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
            <span v-if="r.category === 'PRECON_DECK'" class="badge" :class="`badge-${(r.deckType || 'other').toLowerCase()}`">
              {{ r.deckType || 'DECK' }}
            </span>
            <span v-else class="badge" :class="`badge-${r.type.toLowerCase()}`">{{ r.type }}</span>
          </div>
          <span class="muted" style="font-size:0.75rem;">{{ year(r.releaseDate) }}</span>
        </div>
        <NuxtLink class="product-card-title" :to="`/products/${r.id}`">{{ r.name }}</NuxtLink>

        <div class="product-card-body">
          <div class="product-card-price-row">
            <div>
              <span style="font-size:0.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; display:block;">
                {{ r.category === 'PRECON_DECK' ? 'Prix deck' : r.category === 'SINGLE_BOOSTER' ? 'Prix booster' : 'Prix boîte' }}
              </span>
              <span class="product-card-price">{{ eur(r.price) }}</span>
            </div>
            <div style="text-align:right;">
              <span style="font-size:0.72rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em; display:block;">1 mois</span>
              <span class="tag-var" :class="cls(r.var1m)">{{ pct(r.var1m) }}</span>
            </div>
          </div>

          <div class="product-card-extra">
            <span>EV : <strong style="color: #7aa7ff;">{{ eur(r.ev) }}</strong></span>
            <span v-if="r.stock != null">
              Stock : <strong :style="{ color: r.stock > 0 ? '#4cb782' : 'var(--muted)' }">{{ r.stock }}</strong>
            </span>
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
    </div>
    <div v-if="!rows.length" class="card muted" style="grid-column: 1 / -1; text-align:center; padding:40px;">
      Aucun résultat pour ces critères
    </div>
  </div>

  <!-- BARRE FLOTTANTE DE COMPARAISON -->
  <div v-if="selectedIds.length > 0" class="compare-bar">
    <div class="compare-bar-content">
      <span>
        <strong>{{ selectedIds.length }}</strong> produit(s) sélectionné(s)
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

<style scoped>
.advanced-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 18px;
  margin-bottom: 18px;
  background: rgba(26, 27, 30, 0.6);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
  max-width: 100%;
}

.filter-group-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--muted);
  min-width: 130px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  flex-shrink: 0;
}

.filter-chips {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px;
  flex: 1;
  max-width: 100%;
}

.filter-sm {
  padding: 5px 11px;
  font-size: 0.8rem;
  border-radius: 6px;
  white-space: normal;
}

@media (max-width: 900px) {
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  .filter-group-label {
    min-width: 0;
    font-size: 0.72rem;
  }
  .filter-chips {
    width: 100%;
  }
}

.row-thumb-wrap {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  margin: 0 auto;
}

.row-thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
}

.product-card-image-box {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid var(--border);
  padding: 12px;
  overflow: hidden;
  text-decoration: none;
}

.product-card-cover {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform .25s ease;
}

.product-card:hover .product-card-cover {
  transform: scale(1.08);
}

.product-card-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  opacity: 0.5;
}

.product-card-main {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.mobile-table-hint {
  display: none;
  font-size: 0.75rem;
  margin-bottom: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .mobile-table-hint {
    display: block;
  }
}
</style>
