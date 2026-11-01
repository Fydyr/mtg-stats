<script setup lang="ts">
type Item = {
  id: number
  name: string
  category: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'
  type: string
  deckType?: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER' | null
  releaseDate: string | null
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

const { data } = await useFetch<{ month: string | null; items: Item[] }>('/api/products')
const { getIcon } = useSetIcons()

const items = computed(() => {
  return (data.value?.items ?? [])
    .filter((i) => i.price != null && i.price > 0 && (i.var1m == null || i.var1m > -95))
    .map((i) => {
      const isVintage = i.releaseDate ? new Date(i.releaseDate).getFullYear() < 2003 : false
      const rawEvRatio = (i.ev != null && i.price != null && i.price > 0 && !isVintage)
        ? Math.round((i.ev / i.price) * 100)
        : null
      const evRatio = (rawEvRatio != null && rawEvRatio >= 15 && rawEvRatio <= 250) ? rawEvRatio : null
      return {
        ...i,
        category: (i.category || 'BOOSTER_BOX') as 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK',
        evRatio
      }
    })
})

// Comptages par catégorie
const counts = computed(() => {
  const c = { BOOSTER_BOX: 0, SINGLE_BOOSTER: 0, PRECON_DECK: 0, TOTAL: 0 }
  for (const i of items.value) {
    if (c[i.category] != null) c[i.category]++
    c.TOTAL++
  }
  return c
})

// Produits avec variation 1 mois (exclut les bugs à -100%)
const withVar = computed(() => items.value.filter((i) => i.var1m != null && i.var1m > -95 && i.price != null && i.price > 0))
const avgVar = computed(() =>
  withVar.value.length ? withVar.value.reduce((s, i) => s + i.var1m!, 0) / withVar.value.length : null
)

// Plus forte hausse et plus forte baisse générales
const topGainer = computed(() => [...withVar.value].sort((a, b) => b.var1m! - a.var1m!)[0])
const topDrop = computed(() => [...withVar.value].sort((a, b) => a.var1m! - b.var1m!)[0])

// Meilleur ratio EV (Boîte moderne uniquement, ratio réaliste)
const withEv = computed(() => items.value.filter((i) => i.evRatio != null && i.category === 'BOOSTER_BOX'))
const topEv = computed(() => [...withEv.value].sort((a, b) => b.evRatio! - a.evRatio!)[0])

// Filtre de catégorie pour la section des tops du mois
const activeHighlightCategory = ref<'ALL' | 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'>('ALL')

// Top 5 des hausses du mois (intègre Boîtes, Boosters et Decks)
const top5Gainers = computed(() => {
  if (activeHighlightCategory.value !== 'ALL') {
    return [...withVar.value]
      .filter((i) => i.category === activeHighlightCategory.value)
      .sort((a, b) => b.var1m! - a.var1m!)
      .slice(0, 5)
  }

  const bestBoxes = [...withVar.value].filter((i) => i.category === 'BOOSTER_BOX').sort((a, b) => b.var1m! - a.var1m!)
  const bestBoosters = [...withVar.value].filter((i) => i.category === 'SINGLE_BOOSTER').sort((a, b) => b.var1m! - a.var1m!)
  const bestDecks = [...withVar.value].filter((i) => i.category === 'PRECON_DECK').sort((a, b) => b.var1m! - a.var1m!)

  const mixed: Item[] = []
  const pickedIds = new Set<number>()

  const addUnique = (item?: Item) => {
    if (item && !pickedIds.has(item.id)) {
      mixed.push(item)
      pickedIds.add(item.id)
    }
  }

  addUnique(bestBoxes[0])
  addUnique(bestBoosters[0])
  addUnique(bestDecks[0])
  addUnique(bestBoxes[1])
  addUnique(bestBoosters[1])
  addUnique(bestDecks[1])

  if (mixed.length < 5) {
    const generalTop = [...withVar.value].sort((a, b) => b.var1m! - a.var1m!)
    for (const g of generalTop) {
      addUnique(g)
      if (mixed.length >= 5) break
    }
  }

  return mixed.sort((a, b) => b.var1m! - a.var1m!).slice(0, 5)
})

// Top 5 des baisses du mois (intègre Boîtes, Boosters et Decks)
const top5Losers = computed(() => {
  const losersPool = withVar.value.filter((i) => i.var1m! < 0)

  if (activeHighlightCategory.value !== 'ALL') {
    return [...losersPool]
      .filter((i) => i.category === activeHighlightCategory.value)
      .sort((a, b) => a.var1m! - b.var1m!)
      .slice(0, 5)
  }

  const worstBoxes = [...losersPool].filter((i) => i.category === 'BOOSTER_BOX').sort((a, b) => a.var1m! - b.var1m!)
  const worstBoosters = [...losersPool].filter((i) => i.category === 'SINGLE_BOOSTER').sort((a, b) => a.var1m! - b.var1m!)
  const worstDecks = [...losersPool].filter((i) => i.category === 'PRECON_DECK').sort((a, b) => a.var1m! - b.var1m!)

  const mixed: Item[] = []
  const pickedIds = new Set<number>()

  const addUnique = (item?: Item) => {
    if (item && !pickedIds.has(item.id)) {
      mixed.push(item)
      pickedIds.add(item.id)
    }
  }

  addUnique(worstBoxes[0])
  addUnique(worstBoosters[0])
  addUnique(worstDecks[0])
  addUnique(worstBoxes[1])
  addUnique(worstBoosters[1])
  addUnique(worstDecks[1])

  if (mixed.length < 5) {
    const generalWorst = [...losersPool].sort((a, b) => a.var1m! - b.var1m!)
    for (const w of generalWorst) {
      addUnique(w)
      if (mixed.length >= 5) break
    }
  }

  return mixed.sort((a, b) => a.var1m! - b.var1m!).slice(0, 5)
})

// Titre dynamique de la carte EV selon la catégorie sélectionnée
const evHeaderTitle = computed(() => {
  if (activeHighlightCategory.value === 'SINGLE_BOOSTER') return "Boosters rentables à l'ouverture"
  if (activeHighlightCategory.value === 'PRECON_DECK') return "Decks rentables à l'ouverture"
  if (activeHighlightCategory.value === 'BOOSTER_BOX') return "Boîtes rentables à l'ouverture"
  return "Scellés rentables à l'ouverture"
})

// Top 5 des opportunités EV > Prix filtrées selon la catégorie active
const top5EvOpportunities = computed(() => {
  if (activeHighlightCategory.value !== 'ALL') {
    return [...items.value]
      .filter((i) => i.category === activeHighlightCategory.value && i.evRatio != null && i.evRatio >= 100)
      .sort((a, b) => b.evRatio! - a.evRatio!)
      .slice(0, 5)
  }

  const bestBoxes = [...items.value]
    .filter((i) => i.category === 'BOOSTER_BOX' && i.evRatio != null && i.evRatio >= 100)
    .sort((a, b) => b.evRatio! - a.evRatio!)
  const bestBoosters = [...items.value]
    .filter((i) => i.category === 'SINGLE_BOOSTER' && i.evRatio != null && i.evRatio >= 100)
    .sort((a, b) => b.evRatio! - a.evRatio!)

  const mixed: Item[] = []
  const pickedIds = new Set<number>()

  const addUnique = (item?: Item) => {
    if (item && !pickedIds.has(item.id)) {
      mixed.push(item)
      pickedIds.add(item.id)
    }
  }

  addUnique(bestBoxes[0])
  addUnique(bestBoosters[0])
  addUnique(bestBoxes[1])
  addUnique(bestBoosters[1])
  addUnique(bestBoxes[2])

  if (mixed.length < 5) {
    const generalTop = [...items.value]
      .filter((i) => i.evRatio != null && i.evRatio >= 100)
      .sort((a, b) => b.evRatio! - a.evRatio!)
    for (const g of generalTop) {
      addUnique(g)
      if (mixed.length >= 5) break
    }
  }

  return mixed.sort((a, b) => b.evRatio! - a.evRatio!).slice(0, 5)
})

const eur = (n: number | null) => n == null ? '-' : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
const pct = (n: number | null) => n == null ? '-' : `${n > 0 ? '+' : ''}${n.toFixed(2).replace('.', ',')} %`
const cls = (n: number | null) => n == null ? 'muted' : n > 0 ? 'up' : n < 0 ? 'down' : 'muted'
const monthLabel = (m: string | null) => m ? new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'MTG Stats : cote et prix des scellés Magic: The Gathering',
  ogTitle: 'MTG Stats : cote et prix des scellés Magic: The Gathering',
  description: 'Suivi mensuel et observatoire de la cote des boîtes de boosters, boosters individuels et decks préconstruits Magic: The Gathering.',
  ogDescription: 'Suivi mensuel et observatoire de la cote des boîtes de boosters, boosters individuels et decks préconstruits Magic: The Gathering.',
  ogUrl: () => `${siteUrl.value}/`,
  ogType: 'website'
})
</script>

<template>
  <div class="home-page">
    <!-- HERO PRINCIPAL -->
    <section class="hero">
      <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap;">
        <span class="badge" style="background: rgba(76, 130, 251, 0.15); color: #7aa7ff; border: 1px solid rgba(76, 130, 251, 0.3); font-size: 0.8rem; padding: 5px 12px; border-radius: 999px;">
          <Papicon name="Sparkles" :size="14" />
          <span>Observatoire Scellé MTG</span>
        </span>
        <span v-if="data?.month" class="muted" style="font-size:0.85rem; display:inline-flex; align-items:center; gap:6px;">
          <Papicon name="Calendar" :size="14" />
          <span>Relevé de {{ monthLabel(data.month) }}</span>
        </span>
      </div>
      <h1>Cote &amp; cours des produits scellés Magic</h1>
      <p>
        Suivez l'évolution mensuelle des prix, calculez l'Expected Value (EV) et comparez la rentabilité des
        boîtes de boosters, boosters unitaires et decks préconstruits sur le marché européen.
      </p>
    </section>

    <!-- STATS MACRO -->
    <section class="stats">
      <div class="card stat">
        <div class="label">
          <span>Produits indexés</span>
          <Papicon name="Archive" :size="16" color="#7aa7ff" />
        </div>
        <div class="value">{{ counts.TOTAL }}</div>
        <div class="sub">{{ counts.BOOSTER_BOX }} boîtes · {{ counts.SINGLE_BOOSTER }} boosters · {{ counts.PRECON_DECK }} decks</div>
      </div>
      <div class="card stat">
        <div class="label">
          <span>Variation moyenne (1 mois)</span>
          <Papicon name="Pie" :size="16" color="#949bb0" />
        </div>
        <div class="value" :class="cls(avgVar)">{{ pct(avgVar) }}</div>
        <div class="sub">{{ withVar.length }} produits avec historique</div>
      </div>
      <NuxtLink :to="topGainer ? `/products/${topGainer.id}` : '#'" class="card stat stat-link">
        <div class="label">
          <span>Plus forte hausse</span>
          <Papicon name="ArrowRightUp" :size="16" color="var(--up)" />
        </div>
        <div class="value up">{{ pct(topGainer?.var1m ?? null) }}</div>
        <div class="sub">
          {{ topGainer?.name ?? '-' }}
          <span v-if="topGainer">· {{ topGainer.category === 'PRECON_DECK' ? 'Deck' : topGainer.category === 'SINGLE_BOOSTER' ? 'Booster' : 'Boîte' }}</span>
        </div>
      </NuxtLink>
      <NuxtLink :to="topDrop ? `/products/${topDrop.id}` : '#'" class="card stat stat-link">
        <div class="label">
          <span>Plus forte baisse</span>
          <Papicon name="ArrowRightDown" :size="16" color="var(--down)" />
        </div>
        <div class="value down">{{ pct(topDrop?.var1m ?? null) }}</div>
        <div class="sub">
          {{ topDrop?.name ?? '-' }}
          <span v-if="topDrop">· {{ topDrop.category === 'PRECON_DECK' ? 'Deck' : topDrop.category === 'SINGLE_BOOSTER' ? 'Booster' : 'Boîte' }}</span>
        </div>
      </NuxtLink>
      <NuxtLink :to="topEv ? `/products/${topEv.id}` : '#'" class="card stat stat-link">
        <div class="label">
          <span>Meilleur ratio EV (Boîte)</span>
          <Papicon name="Sparkles" :size="16" color="#7aa7ff" />
        </div>
        <div class="value" style="color:#7aa7ff;">{{ topEv?.evRatio != null ? `${topEv.evRatio} %` : '-' }}</div>
        <div class="sub">{{ topEv?.name ?? '-' }}</div>
      </NuxtLink>
    </section>

    <!-- LES 3 PORTAILS DE CATÉGORIE -->
    <section class="portal-section">
      <h2 class="section-title">Explorer par catégorie</h2>
      <div class="portal-grid">
        <!-- CARTE BOÎTES -->
        <NuxtLink to="/boxes" class="portal-card">
          <div class="portal-icon-box">
            <Papicon name="Archive" :size="24" />
          </div>
          <div class="portal-badge">{{ counts.BOOSTER_BOX }} boîtes</div>
          <h3>Boîtes &amp; Bundles</h3>
          <p>
            Historique complet des boîtes de boosters scellées et bundles (Draft, Set, Play, Collector, Bundles). Suivi des prix, EV et rentabilité à l'ouverture.
          </p>
          <div class="portal-footer">
            <span class="portal-action">
              <span>Consulter les boîtes</span>
              <Papicon name="ArrowRight" :size="16" />
            </span>
          </div>
        </NuxtLink>

        <!-- CARTE BOOSTERS -->
        <NuxtLink to="/boosters" class="portal-card">
          <div class="portal-icon-box purple">
            <Papicon name="Card" :size="24" />
          </div>
          <div class="portal-badge">{{ counts.SINGLE_BOOSTER }} boosters</div>
          <h3>Boosters individuels</h3>
          <p>
            Cotes et prix des paquets de boosters à l'unité. Indispensable pour estimer vos packs isolés, reliques et drafts maison.
          </p>
          <div class="portal-footer">
            <span class="portal-action">
              <span>Consulter les boosters</span>
              <Papicon name="ArrowRight" :size="16" />
            </span>
          </div>
        </NuxtLink>

        <!-- CARTE DECKS -->
        <NuxtLink to="/decks" class="portal-card">
          <div class="portal-icon-box amber">
            <Papicon name="Crown" :size="24" />
          </div>
          <div class="portal-badge">{{ counts.PRECON_DECK }} decks</div>
          <h3>Decks préconstruits</h3>
          <p>
            Suivi des cotes pour les decks officiels prêts à jouer : Commander, Challenger Decks, Kits d'initiation et Starter sets.
          </p>
          <div class="portal-footer">
            <span class="portal-action">
              <span>Consulter les decks</span>
              <Papicon name="ArrowRight" :size="16" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- EN-TETE DE LA SECTION TENDANCES AVEC FILTRE PAR CATEGORIE -->
    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-top: 8px;">
      <div>
        <h2 class="section-title" style="margin: 0;">Tendances du marché</h2>
        <p class="muted" style="margin: 4px 0 0; font-size: 0.85rem;">
          Les plus fortes variations du mois sur les boîtes, boosters individuels et decks préconstruits.
        </p>
      </div>
      <div class="chips">
        <button
          class="chip"
          :class="{ active: activeHighlightCategory === 'ALL' }"
          @click="activeHighlightCategory = 'ALL'"
        >
          <Papicon name="Grid" :size="15" />
          <span>Tous les scellés</span>
        </button>
        <button
          class="chip"
          :class="{ active: activeHighlightCategory === 'BOOSTER_BOX' }"
          @click="activeHighlightCategory = 'BOOSTER_BOX'"
        >
          <Papicon name="Archive" :size="15" />
          <span>Boîtes</span>
        </button>
        <button
          class="chip"
          :class="{ active: activeHighlightCategory === 'SINGLE_BOOSTER' }"
          @click="activeHighlightCategory = 'SINGLE_BOOSTER'"
        >
          <Papicon name="Card" :size="15" />
          <span>Boosters</span>
        </button>
        <button
          class="chip"
          :class="{ active: activeHighlightCategory === 'PRECON_DECK' }"
          @click="activeHighlightCategory = 'PRECON_DECK'"
        >
          <Papicon name="Crown" :size="15" />
          <span>Decks</span>
        </button>
      </div>
    </div>

    <!-- BLOCS DES TOPS : TOP HAUSSES, TOP BAISSES & OPPORTUNITÉS EV -->
    <section class="highlights-grid">
      <!-- TOP HAUSSES -->
      <div class="card highlight-card">
        <div class="highlight-header">
          <h3 style="margin:0; font-size:1.12rem; display:inline-flex; align-items:center; gap:9px;">
            <span class="icon-box up" style="width:30px; height:30px; border-radius:9px;">
              <Papicon name="ArrowRightUp" :size="16" />
            </span>
            <span>Plus fortes hausses</span>
          </h3>
          <span class="muted" style="font-size:0.8rem;">1 mois</span>
        </div>
        <div class="mini-list">
          <div v-for="item in top5Gainers" :key="item.id" class="mini-row">
            <div class="mini-row-info">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="mini-row-thumb"
                loading="lazy"
              />
              <img
                v-else-if="getIcon(item.name)?.icon"
                :src="getIcon(item.name)!.icon"
                :alt="getIcon(item.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <div>
                <NuxtLink :to="`/products/${item.id}`" class="mini-row-title">{{ item.name }}</NuxtLink>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                  <span
                    v-if="item.category === 'PRECON_DECK'"
                    class="badge"
                    style="background: rgba(251, 191, 36, 0.14); color: #fcd34d; border: 1px solid rgba(251, 191, 36, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Crown" :size="11" />
                    <span>{{ item.deckType || 'Deck' }}</span>
                  </span>
                  <span
                    v-else-if="item.category === 'SINGLE_BOOSTER'"
                    class="badge"
                    style="background: rgba(192, 132, 252, 0.14); color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Card" :size="11" />
                    <span>Booster</span>
                  </span>
                  <span
                    v-else
                    class="badge"
                    style="background: rgba(76, 130, 251, 0.14); color: #7aa7ff; border: 1px solid rgba(76, 130, 251, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Archive" :size="11" />
                    <span>Boîte {{ item.type }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="mini-row-numbers">
              <span style="font-weight:700;">{{ eur(item.price) }}</span>
              <span class="tag-var up">{{ pct(item.var1m) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- TOP BAISSES -->
      <div class="card highlight-card">
        <div class="highlight-header">
          <h3 style="margin:0; font-size:1.12rem; display:inline-flex; align-items:center; gap:9px;">
            <span class="icon-box down" style="width:30px; height:30px; border-radius:9px;">
              <Papicon name="ArrowRightDown" :size="16" />
            </span>
            <span>Plus fortes baisses</span>
          </h3>
          <span class="muted" style="font-size:0.8rem;">1 mois</span>
        </div>
        <div class="mini-list">
          <div v-for="item in top5Losers" :key="item.id" class="mini-row">
            <div class="mini-row-info">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="mini-row-thumb"
                loading="lazy"
              />
              <img
                v-else-if="getIcon(item.name)?.icon"
                :src="getIcon(item.name)!.icon"
                :alt="getIcon(item.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <div>
                <NuxtLink :to="`/products/${item.id}`" class="mini-row-title">{{ item.name }}</NuxtLink>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                  <span
                    v-if="item.category === 'PRECON_DECK'"
                    class="badge"
                    style="background: rgba(251, 191, 36, 0.14); color: #fcd34d; border: 1px solid rgba(251, 191, 36, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Crown" :size="11" />
                    <span>{{ item.deckType || 'Deck' }}</span>
                  </span>
                  <span
                    v-else-if="item.category === 'SINGLE_BOOSTER'"
                    class="badge"
                    style="background: rgba(192, 132, 252, 0.14); color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Card" :size="11" />
                    <span>Booster</span>
                  </span>
                  <span
                    v-else
                    class="badge"
                    style="background: rgba(76, 130, 251, 0.14); color: #7aa7ff; border: 1px solid rgba(76, 130, 251, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Archive" :size="11" />
                    <span>Boîte {{ item.type }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="mini-row-numbers">
              <span style="font-weight:700;">{{ eur(item.price) }}</span>
              <span class="tag-var down">{{ pct(item.var1m) }}</span>
            </div>
          </div>
          <div v-if="!top5Losers.length" class="muted" style="text-align:center; padding:20px;">
            Aucune baisse enregistrée
          </div>
        </div>
      </div>

      <!-- OPPORTUNITÉS EV > PRIX -->
      <div class="card highlight-card">
        <div class="highlight-header">
          <h3 style="margin:0; font-size:1.12rem; display:inline-flex; align-items:center; gap:9px;">
            <span class="icon-box" style="width:30px; height:30px; border-radius:9px;">
              <Papicon name="PiggyBank" :size="16" />
            </span>
            <span>{{ evHeaderTitle }}</span>
          </h3>
          <span class="badge" style="background: rgba(52, 211, 153, 0.16); color: var(--up);">EV &gt; Prix</span>
        </div>
        <div class="mini-list">
          <div v-for="item in top5EvOpportunities" :key="item.id" class="mini-row">
            <div class="mini-row-info">
              <img
                v-if="item.imageUrl"
                :src="item.imageUrl"
                :alt="item.name"
                class="mini-row-thumb"
                loading="lazy"
              />
              <img
                v-else-if="getIcon(item.name)?.icon"
                :src="getIcon(item.name)!.icon"
                :alt="getIcon(item.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <div>
                <NuxtLink :to="`/products/${item.id}`" class="mini-row-title">{{ item.name }}</NuxtLink>
                <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                  <span
                    v-if="item.category === 'PRECON_DECK'"
                    class="badge"
                    style="background: rgba(251, 191, 36, 0.14); color: #fcd34d; border: 1px solid rgba(251, 191, 36, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Crown" :size="11" />
                    <span>{{ item.deckType || 'Deck' }}</span>
                  </span>
                  <span
                    v-else-if="item.category === 'SINGLE_BOOSTER'"
                    class="badge"
                    style="background: rgba(192, 132, 252, 0.14); color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Card" :size="11" />
                    <span>Booster</span>
                  </span>
                  <span
                    v-else
                    class="badge"
                    style="background: rgba(76, 130, 251, 0.14); color: #7aa7ff; border: 1px solid rgba(76, 130, 251, 0.28); font-size: 0.65rem; padding: 1px 6px;"
                  >
                    <Papicon name="Archive" :size="11" />
                    <span>Boîte {{ item.type }}</span>
                  </span>
                </div>
              </div>
            </div>
            <div class="mini-row-numbers">
              <span style="font-weight:700;">{{ eur(item.price) }}</span>
              <span class="tag-var up" :title="`EV : ${eur(item.ev)}`">{{ item.evRatio }} %</span>
            </div>
          </div>
          <div v-if="!top5EvOpportunities.length" class="muted" style="text-align:center; padding:20px; font-size:0.85rem; line-height:1.4;">
            <template v-if="activeHighlightCategory === 'PRECON_DECK'">
              Les decks préconstruits ont un contenu fixe (cartes connues à l'avance sans tirage aléatoire). L'EV s'applique aux boîtes et boosters.
            </template>
            <template v-else-if="activeHighlightCategory === 'SINGLE_BOOSTER'">
              Aucun booster individuel avec EV &gt; Prix ce mois-ci
            </template>
            <template v-else-if="activeHighlightCategory === 'BOOSTER_BOX'">
              Aucune boîte avec EV &gt; Prix ce mois-ci
            </template>
            <template v-else>
              Aucun scellé avec EV &gt; Prix ce mois-ci
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- BANNIÈRE TENDANCES MARCHÉ -->
    <section class="market-cta card">
      <div class="market-cta-content">
        <div style="display:flex; align-items:center; gap:16px;">
          <div class="icon-box" style="width:48px; height:48px; border-radius:14px;">
            <Papicon name="Pie" :size="24" />
          </div>
          <div>
            <h3 style="margin:0 0 6px 0; font-size:1.25rem;">Analyse macro &amp; distribution des prix</h3>
            <p class="muted" style="margin:0; line-height:1.5;">
              Visualisez les indices de marché, la distribution des prix par tranche et les plus gros volumes de variation dans notre section dédiée.
            </p>
          </div>
        </div>
        <NuxtLink to="/market" class="btn" style="white-space:nowrap; padding: 10px 22px;">
          <span>Voir les Tendances Marché</span>
          <Papicon name="ArrowRight" :size="16" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.portal-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  position: relative;
  text-decoration: none;
  color: var(--text);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.portal-card:hover {
  background: var(--card-hover);
  border-color: rgba(76, 130, 251, 0.5);
  transform: translateY(-3px);
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.38), 0 0 24px rgba(76, 130, 251, 0.12);
}

.portal-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--accent-soft);
  color: var(--accent-bright);
  border: 1px solid rgba(76, 130, 251, 0.3);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.portal-icon-box.purple {
  background: rgba(192, 132, 252, 0.14);
  color: #d8b4fe;
  border-color: rgba(192, 132, 252, 0.3);
}

.portal-icon-box.amber {
  background: rgba(251, 191, 36, 0.14);
  color: #fcd34d;
  border-color: rgba(251, 191, 36, 0.3);
}

.portal-badge {
  position: absolute;
  top: 22px;
  right: 22px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--muted);
  border: 1px solid var(--border);
}

.portal-card h3 {
  font-size: 1.28rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text);
}

.portal-card p {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.55;
  margin: 0 0 20px 0;
  flex: 1;
}

.portal-footer {
  margin-top: auto;
}

.portal-action {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent-bright);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: gap 0.15s ease;
}

.portal-card:hover .portal-action {
  gap: 10px;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 18px;
}

.highlight-card {
  padding: 20px;
}

.highlight-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

.mini-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mini-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.mini-row:last-child {
  border-bottom: none;
}

.mini-row-info {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mini-row-thumb {
  width: 32px;
  height: 32px;
  object-fit: contain;
  border-radius: 4px;
  flex-shrink: 0;
}

.mini-row-title {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  display: block;
}

.mini-row-title:hover {
  color: var(--accent-bright);
}

.mini-row-numbers {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.market-cta {
  background: linear-gradient(135deg, rgba(20, 24, 34, 0.95) 0%, rgba(76, 130, 251, 0.12) 100%);
  border: 1px solid rgba(76, 130, 251, 0.3);
  padding: 24px;
}

.market-cta-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
</style>
