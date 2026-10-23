<script setup lang="ts">
type Item = {
  id: number
  name: string
  category: 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK'
  type: string
  deckType?: 'COMMANDER' | 'CHALLENGER' | 'STARTER' | 'OTHER' | null
  releaseDate: string | null
  cardmarket: string
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
  return (data.value?.items ?? []).map((i) => ({
    ...i,
    category: (i.category || 'BOOSTER_BOX') as 'BOOSTER_BOX' | 'SINGLE_BOOSTER' | 'PRECON_DECK',
    evRatio: (i.ev != null && i.price != null && i.price > 0) ? Math.round((i.ev / i.price) * 100) : null
  }))
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

// Produits avec variation 1 mois
const withVar = computed(() => items.value.filter((i) => i.var1m != null))
const avgVar = computed(() =>
  withVar.value.length ? withVar.value.reduce((s, i) => s + i.var1m!, 0) / withVar.value.length : null
)

// Plus forte hausse générale
const topGainer = computed(() => [...withVar.value].sort((a, b) => b.var1m! - a.var1m!)[0])

// Meilleur ratio EV
const withEv = computed(() => items.value.filter((i) => i.evRatio != null && i.category === 'BOOSTER_BOX'))
const topEv = computed(() => [...withEv.value].sort((a, b) => b.evRatio! - a.evRatio!)[0])

// Top 5 des hausses du mois
const top5Gainers = computed(() =>
  [...withVar.value].sort((a, b) => b.var1m! - a.var1m!).slice(0, 5)
)

// Top 5 des opportunités EV > Prix
const top5EvOpportunities = computed(() =>
  [...items.value.filter((i) => i.category === 'BOOSTER_BOX' && i.evRatio != null && i.evRatio >= 100)]
    .sort((a, b) => b.evRatio! - a.evRatio!)
    .slice(0, 5)
)

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
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <span class="badge" style="background: rgba(91, 141, 239, 0.15); color: #7aa7ff; border: 1px solid rgba(91, 141, 239, 0.3); font-size: 0.8rem; padding: 4px 10px;">
          ✦ Observatoire Scellé MTG
        </span>
        <span v-if="data?.month" class="muted" style="font-size:0.85rem;">
          Relevé de {{ monthLabel(data.month) }}
        </span>
      </div>
      <h1>Cote & cours des produits scellés Magic</h1>
      <p>
        Suivez l'évolution mensuelle des prix, calculez l'Expected Value (EV) et comparez la rentabilité des
        boîtes de boosters, boosters unitaires et decks préconstruits sur le marché européen.
      </p>
    </section>

    <!-- STATS MACRO -->
    <section class="stats">
      <div class="card stat">
        <div class="label">Produits indexés</div>
        <div class="value">{{ counts.TOTAL }}</div>
        <div class="sub">456 boîtes · 627 boosters · 919 decks</div>
      </div>
      <div class="card stat">
        <div class="label">Variation moyenne (1 mois)</div>
        <div class="value" :class="cls(avgVar)">{{ pct(avgVar) }}</div>
        <div class="sub">{{ withVar.length }} produits avec historique</div>
      </div>
      <NuxtLink :to="topGainer ? `/products/${topGainer.id}` : '#'" class="card stat stat-link">
        <div class="label">Plus forte hausse</div>
        <div class="value up">{{ pct(topGainer?.var1m ?? null) }}</div>
        <div class="sub">{{ topGainer?.name ?? '-' }}</div>
      </NuxtLink>
      <NuxtLink :to="topEv ? `/products/${topEv.id}` : '#'" class="card stat stat-link">
        <div class="label">Meilleur ratio EV (Boîte)</div>
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
          <div class="portal-icon">📦</div>
          <div class="portal-badge">{{ counts.BOOSTER_BOX }} boîtes</div>
          <h3>Boîtes de boosters</h3>
          <p>
            Historique complet des boîtes de boosters scellées (Draft, Set, Play, Collector). Suivi des prix, EV et rentabilité à l'ouverture.
          </p>
          <div class="portal-footer">
            <span class="portal-action">Consulter les boîtes →</span>
          </div>
        </NuxtLink>

        <!-- CARTE BOOSTERS -->
        <NuxtLink to="/boosters" class="portal-card">
          <div class="portal-icon">🃏</div>
          <div class="portal-badge">{{ counts.SINGLE_BOOSTER }} boosters</div>
          <h3>Boosters individuels</h3>
          <p>
            Cotes et prix des paquets de boosters à l'unité. Indispensable pour estimer vos packs isolés, reliques et drafts maison.
          </p>
          <div class="portal-footer">
            <span class="portal-action">Consulter les boosters →</span>
          </div>
        </NuxtLink>

        <!-- CARTE DECKS -->
        <NuxtLink to="/decks" class="portal-card">
          <div class="portal-icon">⚔️</div>
          <div class="portal-badge">{{ counts.PRECON_DECK }} decks</div>
          <h3>Decks préconstruits</h3>
          <p>
            Suivi des cotes pour les decks officiels prêts à jouer : Commander, Challenger Decks, Kits d'initiation et Starter sets.
          </p>
          <div class="portal-footer">
            <span class="portal-action">Consulter les decks →</span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- DEUX BLOCS : TOP HAUSSES & OPPORTUNITÉS EV -->
    <section class="highlights-grid">
      <!-- TOP HAUSSES -->
      <div class="card highlight-card">
        <div class="highlight-header">
          <h3 style="margin:0; font-size:1.15rem;">🔥 Plus fortes hausses du mois</h3>
          <span class="muted" style="font-size:0.8rem;">1 mois</span>
        </div>
        <div class="mini-list">
          <div v-for="item in top5Gainers" :key="item.id" class="mini-row">
            <div class="mini-row-info">
              <img
                v-if="getIcon(item.name)?.icon"
                :src="getIcon(item.name)!.icon"
                :alt="getIcon(item.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <div>
                <NuxtLink :to="`/products/${item.id}`" class="mini-row-title">{{ item.name }}</NuxtLink>
                <div class="muted" style="font-size:0.75rem;">
                  {{ item.category === 'PRECON_DECK' ? (item.deckType || 'Deck') : item.type }}
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

      <!-- OPPORTUNITÉS EV > PRIX -->
      <div class="card highlight-card">
        <div class="highlight-header">
          <h3 style="margin:0; font-size:1.15rem;">💎 Boîtes rentables à l'ouverture</h3>
          <span class="badge" style="background: rgba(76, 183, 130, 0.2); color: #4cb782;">EV &gt; Prix</span>
        </div>
        <div class="mini-list">
          <div v-for="item in top5EvOpportunities" :key="item.id" class="mini-row">
            <div class="mini-row-info">
              <img
                v-if="getIcon(item.name)?.icon"
                :src="getIcon(item.name)!.icon"
                :alt="getIcon(item.name)!.code"
                class="set-icon"
                loading="lazy"
              />
              <div>
                <NuxtLink :to="`/products/${item.id}`" class="mini-row-title">{{ item.name }}</NuxtLink>
                <div class="muted" style="font-size:0.75rem;">Boîte {{ item.type }}</div>
              </div>
            </div>
            <div class="mini-row-numbers">
              <span style="font-weight:700;">{{ eur(item.price) }}</span>
              <span class="tag-var up" :title="`EV : ${eur(item.ev)}`">{{ item.evRatio }} %</span>
            </div>
          </div>
          <div v-if="!top5EvOpportunities.length" class="muted" style="text-align:center; padding:20px;">
            Aucune boîte avec EV &gt; Prix ce mois-ci
          </div>
        </div>
      </div>
    </section>

    <!-- BANNIÈRE TENDANCES MARCHÉ -->
    <section class="market-cta card">
      <div class="market-cta-content">
        <div>
          <h3 style="margin:0 0 6px 0; font-size:1.25rem;">📊 Analyse macro & distribution des prix</h3>
          <p class="muted" style="margin:0; line-height:1.5;">
            Visualisez les indices de marché, la distribution des prix par tranche et les plus gros volumes de variation dans notre section dédiée.
          </p>
        </div>
        <NuxtLink to="/market" class="btn" style="white-space:nowrap; padding: 10px 22px;">
          Voir les Tendances Marché →
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
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: -0.01em;
}

.portal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 18px;
}

.portal-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all .2s ease;
  position: relative;
  text-decoration: none;
  color: var(--text);
}

.portal-card:hover {
  background: var(--card-hover);
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.portal-icon {
  font-size: 2.2rem;
  margin-bottom: 12px;
}

.portal-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--muted);
  border: 1px solid var(--border);
}

.portal-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: var(--text);
}

.portal-card p {
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0 0 20px 0;
  flex: 1;
}

.portal-footer {
  margin-top: auto;
}

.portal-action {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--accent);
  display: inline-flex;
  align-items: center;
  transition: gap .15s ease;
}

.portal-card:hover .portal-action {
  color: #7aa7ff;
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
  color: var(--accent);
}

.mini-row-numbers {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}

.market-cta {
  background: linear-gradient(135deg, rgba(26, 27, 30, 0.9) 0%, rgba(91, 141, 239, 0.1) 100%);
  border: 1px solid rgba(91, 141, 239, 0.3);
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
