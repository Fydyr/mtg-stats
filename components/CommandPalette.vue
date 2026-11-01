<script setup lang="ts">
const isOpen = defineModel<boolean>('open', { default: false })
const router = useRouter()
const { getIcon } = useSetIcons()

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)
const hasLoaded = ref(false)

type CatalogItem = {
  id: number
  name: string
  category?: string
  type: string
  deckType?: string | null
  price: number | null
  evRatio: number | null
  var1m: number | null
  imageUrl?: string | null
}

const catalogItems = ref<CatalogItem[]>([])
const loading = ref(false)

async function ensureCatalogLoaded() {
  if (hasLoaded.value || loading.value) return
  loading.value = true
  try {
    const res = await $fetch<{ items: CatalogItem[] }>('/api/products')
    catalogItems.value = res.items || []
    hasLoaded.value = true
  } catch {
    // ignore
  } finally {
    loading.value = false
  }
}

watch(isOpen, async (val) => {
  if (val) {
    query.value = ''
    activeIndex.value = 0
    ensureCatalogLoaded()
    await nextTick()
    inputRef.value?.focus()
  }
})

const quickLinks = [
  { label: 'Catalogue des Boîtes de Boosters', sub: 'Draft, Play, Set, Collector & Bundles', to: '/boxes', icon: 'Archive' },
  { label: 'Boosters à l’unité', sub: 'Cotes des boosters individuels', to: '/boosters', icon: 'Card' },
  { label: 'Decks Préconstruits', sub: 'Commander, Challenger & Starter', to: '/decks', icon: 'Crown' },
  { label: 'Comparateur Face-à-Face', sub: 'Superposer les courbes de prix et EV', to: '/compare', icon: 'Pillar' },
  { label: 'Tendances du Marché Scellé', sub: 'Top 10 hausses, baisses et opportunités EV', to: '/market', icon: 'Pie' }
]

const filteredProducts = computed(() => {
  const q = query.value.toLowerCase().trim()
  if (!q) return catalogItems.value.filter((i) => i.price != null && i.price > 0).slice(0, 6)
  const terms = q.split(/\s+/).filter(Boolean)
  return catalogItems.value
    .filter((item) => {
      const hay = `${item.name} ${item.type} ${item.deckType || ''} ${item.category || ''}`.toLowerCase()
      return terms.every((t) => hay.includes(t))
    })
    .slice(0, 10)
})

watch(query, () => {
  activeIndex.value = 0
})

function goToProduct(id: number) {
  isOpen.value = false
  router.push(`/products/${id}`)
}

function compareProduct(id: number, e: Event) {
  e.stopPropagation()
  isOpen.value = false
  router.push(`/compare?ids=${id}`)
}

function goToLink(to: string) {
  isOpen.value = false
  router.push(to)
}

function onKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    isOpen.value = !isOpen.value
    return
  }
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    e.preventDefault()
    isOpen.value = false
    return
  }

  const maxIdx = filteredProducts.value.length - 1
  if (maxIdx < 0) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = activeIndex.value >= maxIdx ? 0 : activeIndex.value + 1
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = activeIndex.value <= 0 ? maxIdx : activeIndex.value - 1
  } else if (e.key === 'Enter') {
    const picked = filteredProducts.value[activeIndex.value]
    if (picked) {
      e.preventDefault()
      goToProduct(picked.id)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cmd-fade">
      <div v-if="isOpen" class="cmd-overlay" @click.self="isOpen = false">
        <div class="cmd-modal card" role="dialog" aria-modal="true" aria-label="Recherche rapide">
          <!-- Barre de saisie -->
          <div class="cmd-input-bar">
            <Papicon name="Search" :size="18" class="cmd-search-icon" />
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="cmd-input"
              placeholder="Rechercher une boîte, un booster, un deck ou une édition..."
            />
            <button v-if="query" class="cmd-clear-btn" type="button" @click="query = ''">
              <Papicon name="Cross" :size="14" />
            </button>
            <kbd class="cmd-kbd" @click="isOpen = false">ESC</kbd>
          </div>

          <div class="cmd-body">
            <!-- Raccourcis rapides quand la recherche est vide -->
            <div v-if="!query.trim()" class="cmd-section">
              <div class="cmd-section-title">Navigation rapide</div>
              <div class="cmd-quick-grid">
                <button
                  v-for="link in quickLinks"
                  :key="link.to"
                  type="button"
                  class="cmd-quick-item"
                  @click="goToLink(link.to)"
                >
                  <span class="icon-box" style="width: 30px; height: 30px; border-radius: 8px;">
                    <Papicon :name="link.icon" :size="15" />
                  </span>
                  <div style="min-width: 0; text-align: left;">
                    <div class="cmd-quick-label">{{ link.label }}</div>
                    <div class="cmd-quick-sub">{{ link.sub }}</div>
                  </div>
                </button>
              </div>
            </div>

            <!-- Liste des produits -->
            <div class="cmd-section">
              <div class="cmd-section-title">
                {{ query.trim() ? `Résultats (${filteredProducts.length})` : 'Produits populaires' }}
              </div>

              <div v-if="loading && !filteredProducts.length" class="muted" style="padding: 24px; text-align: center; font-size: 0.85rem;">
                Chargement du catalogue...
              </div>

              <div v-else-if="!filteredProducts.length" class="muted" style="padding: 28px; text-align: center; font-size: 0.88rem;">
                Aucun produit scellé trouvé pour « {{ query }} ».
              </div>

              <div v-else class="cmd-results-list">
                <div
                  v-for="(item, idx) in filteredProducts"
                  :key="item.id"
                  class="cmd-result-row"
                  :class="{ active: idx === activeIndex }"
                  @mouseenter="activeIndex = idx"
                  @click="goToProduct(item.id)"
                >
                  <div class="cmd-result-thumb">
                    <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" loading="lazy" />
                    <img
                      v-else-if="getIcon(item.name)?.icon"
                      :src="getIcon(item.name)!.icon"
                      :alt="getIcon(item.name)!.code"
                      class="set-icon"
                    />
                    <Papicon v-else name="Archive" :size="18" :opacity="0.5" />
                  </div>

                  <div class="cmd-result-main">
                    <div class="cmd-result-name">{{ item.name }}</div>
                    <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                      <span v-if="item.category === 'PRECON_DECK'" class="badge" :class="`badge-${(item.deckType || 'other').toLowerCase()}`" style="font-size: 0.62rem; padding: 1px 6px;">
                        Deck {{ item.deckType || '' }}
                      </span>
                      <span v-else class="badge" :class="`badge-${item.type.toLowerCase()}`" style="font-size: 0.62rem; padding: 1px 6px;">
                        {{ item.category === 'SINGLE_BOOSTER' ? `Booster ${item.type}` : `Boîte ${item.type}` }}
                      </span>
                      <span v-if="item.evRatio != null && item.evRatio >= 100" class="badge" style="font-size: 0.62rem; padding: 1px 6px; background: rgba(52, 211, 153, 0.15); color: #34d399;">
                        EV {{ item.evRatio }} %
                      </span>
                    </div>
                  </div>

                  <div class="cmd-result-right">
                    <span class="cmd-result-price">{{ item.price != null ? `${item.price} €` : '-' }}</span>
                    <button
                      type="button"
                      class="btn ghost cmd-compare-btn"
                      title="Comparer ce produit"
                      @click="compareProduct(item.id, $event)"
                    >
                      <Papicon name="Pillar" :size="13" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="cmd-footer">
            <span><kbd>↑</kbd> <kbd>↓</kbd> Naviguer</span>
            <span><kbd>Entrée</kbd> Ouvrir la fiche</span>
            <span><kbd>Ctrl</kbd>+<kbd>K</kbd> Fermer</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cmd-overlay {
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(6, 8, 12, 0.72);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 8vh 16px 24px;
}

.cmd-modal {
  width: 100%;
  max-width: 640px;
  padding: 0;
  overflow: hidden;
  border-color: rgba(99, 144, 240, 0.35);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.65);
}

.cmd-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
}

.cmd-search-icon {
  color: var(--accent-hover);
  flex-shrink: 0;
}

.cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.98rem;
  font-family: inherit;
}

.cmd-input::placeholder {
  color: var(--muted);
}

.cmd-clear-btn {
  background: rgba(255, 255, 255, 0.06);
  border: none;
  color: var(--muted);
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.cmd-kbd {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
  color: var(--muted);
  cursor: pointer;
}

.cmd-body {
  max-height: 62vh;
  overflow-y: auto;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cmd-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  margin-bottom: 8px;
  padding: 0 4px;
}

.cmd-quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 8px;
}

.cmd-quick-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 11px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--text);
  cursor: pointer;
  transition: all 0.15s ease;
}

.cmd-quick-item:hover {
  border-color: rgba(99, 144, 240, 0.45);
  background: rgba(99, 144, 240, 0.08);
}

.cmd-quick-label {
  font-size: 0.84rem;
  font-weight: 600;
}

.cmd-quick-sub {
  font-size: 0.72rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmd-results-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cmd-result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 0.14s ease;
}

.cmd-result-row.active {
  background: rgba(99, 144, 240, 0.14);
}

.cmd-result-thumb {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 3px;
}

.cmd-result-thumb img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.cmd-result-main {
  flex: 1;
  min-width: 0;
}

.cmd-result-name {
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cmd-result-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.cmd-result-price {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  font-size: 0.98rem;
  color: #34d399;
}

.cmd-compare-btn {
  padding: 5px 8px;
}

.cmd-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-top: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.015);
  font-size: 0.74rem;
  color: var(--muted);
}

.cmd-footer kbd {
  font-size: 0.68rem;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--border);
}

.cmd-fade-enter-active,
.cmd-fade-leave-active {
  transition: opacity 0.16s ease;
}

.cmd-fade-enter-from,
.cmd-fade-leave-to {
  opacity: 0;
}
</style>

