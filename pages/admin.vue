<script setup lang="ts">
type Row = {
  id: number
  name: string
  type: string
  releaseDate: string | null
  price: number
  ev: number | null
  previous: number
  cardmarketUrl: string
}
type Form = { name: string; type: string; releaseDate: string }

const { data: me, refresh: refreshMe } = await useFetch<{ admin: boolean }>('/api/admin/me')

const password = ref('')
const month = ref(new Date().toISOString().slice(0, 7))
const rows = ref<{
  id: number
  name: string
  type: string
  releaseDate: string
  previous: number | null
  value: string
  evValue: string
  cardmarketUrl: string
}[]>([])

const loading = ref(false)
const syncingSheet = ref(false)
const syncingEv = ref(false)
const sheetUrl = ref('https://docs.google.com/spreadsheets/d/1668tbtGyFHhB-x3c9b7ft546PK3fsKMR8eK7iLCh0ps')
const toast = ref<{ msg: string; error?: boolean } | null>(null)
const searchFilter = ref('')
const typeFilter = ref('ALL')
const showBulkPaste = ref(false)
const bulkText = ref('')

const newProduct = reactive<Form>({ name: '', type: 'DRAFT', releaseDate: '' })

const cmFiles = ref<File[]>([])
const cmMonth = ref(new Date().toISOString().slice(0, 7))
const cmPriceField = ref('low')
const cmUploading = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

function onCmFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    cmFiles.value = Array.from(target.files)
  }
}

async function uploadCardmarketFiles() {
  if (!cmFiles.value.length) {
    notify('Veuillez sélectionner au moins un fichier Cardmarket (.csv ou .csv.gz)', true)
    return
  }

  cmUploading.value = true
  try {
    const formData = new FormData()
    formData.append('month', cmMonth.value)
    formData.append('priceField', cmPriceField.value)
    for (const f of cmFiles.value) {
      formData.append('files', f)
    }

    const res = await $fetch<{
      ok: boolean
      month: string
      importedProducts: number
      updatedProducts: number
      importedPrices: number
    }>('/api/admin/import-cardmarket', {
      method: 'POST',
      body: formData
    })

    notify(
      `Import Cardmarket réussi : ${res.importedProducts} boîtes créées, ${res.updatedProducts} mises à jour, ${res.importedPrices} prix enregistrés pour ${res.month} !`
    )
    cmFiles.value = []
    if (fileInputRef.value) fileInputRef.value.value = ''
    await load()
  } catch (err: any) {
    notify(err?.statusMessage || "Erreur lors de l'import Cardmarket", true)
  } finally {
    cmUploading.value = false
  }
}

const cmSyncingDirect = ref(false)

async function syncCardmarketDirectly() {
  cmSyncingDirect.value = true
  try {
    const res = await $fetch<{
      ok: boolean
      month: string
      productsCount: number
      pricesCount: number
    }>('/api/admin/sync-cardmarket', {
      method: 'POST',
      body: { month: cmMonth.value, priceField: cmPriceField.value }
    })
    notify(
      `Synchronisation Cardmarket réussie : ${res.productsCount} boîtes scellées traitées, ${res.pricesCount} prix enregistrés pour ${res.month} !`
    )
    await load()
  } catch (err: any) {
    notify(err?.statusMessage || 'Erreur lors de la synchronisation directe Cardmarket', true)
  } finally {
    cmSyncingDirect.value = false
  }
}

const TYPES = [
  { v: 'ALL', l: 'Tous' },
  { v: 'DRAFT', l: 'Draft' },
  { v: 'SET', l: 'Set' },
  { v: 'PLAY', l: 'Play' },
  { v: 'COLLECTOR', l: 'Collector' },
  { v: 'OTHER', l: 'Autres' }
]

function notify(msg: string, error = false) {
  toast.value = { msg, error }
  setTimeout(() => (toast.value = null), 4000)
}

async function login() {
  try {
    await $fetch('/api/admin/login', { method: 'POST', body: { password: password.value } })
    password.value = ''
    await refreshMe()
    await load()
  } catch {
    notify('Mot de passe incorrect', true)
  }
}

async function logout() {
  await $fetch('/api/admin/logout', { method: 'POST' })
  await refreshMe()
}

async function load() {
  loading.value = true
  try {
    const list = await $fetch<Row[]>('/api/admin/prices', { query: { month: month.value } })
    rows.value = list.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      releaseDate: r.releaseDate || '',
      cardmarketUrl: r.cardmarketUrl,
      previous: Number.isNaN(r.previous) ? null : r.previous,
      value: Number.isNaN(r.price) ? '' : String(r.price),
      evValue: r.ev != null && !Number.isNaN(r.ev) ? String(r.ev) : ''
    }))
  } catch {
    notify('Chargement impossible', true)
  }
  loading.value = false
}

async function syncGoogleSheet() {
  syncingSheet.value = true
  try {
    const res = await $fetch<{ ok: boolean; products: number; prices: number }>('/api/admin/sync-sheet', {
      method: 'POST',
      body: { sheetUrl: sheetUrl.value }
    })
    notify(`Synchronisation terminée : ${res.products} boîtes et ${res.prices} prix synchronisés !`)
    await load()
  } catch (e: any) {
    notify(e?.statusMessage || 'Erreur lors de la synchronisation du Google Sheet', true)
  }
  syncingSheet.value = false
}

async function syncEv() {
  syncingEv.value = true
  try {
    const res = await $fetch<{ ok: boolean; month: string; matchedCount: number }>('/api/admin/sync-ev', {
      method: 'POST',
      body: { month: month.value }
    })
    notify(`Synchronisation EV réussie : ${res.matchedCount} boîtes associées avec leur Expected Value pour ${res.month} !`)
    await load()
  } catch (e: any) {
    notify(e?.statusMessage || 'Erreur lors de la synchronisation des EV', true)
  } finally {
    syncingEv.value = false
  }
}

async function save() {
  try {
    const prices = rows.value.map((r) => ({
      productId: r.id,
      type: r.type as any,
      releaseDate: r.releaseDate || null,
      cardmarketUrl: r.cardmarketUrl,
      price: r.value.trim() === '' ? null : Number(r.value.replace(',', '.')),
      ev: r.evValue.trim() === '' ? null : Number(r.evValue.replace(',', '.'))
    }))
    await $fetch('/api/admin/prices', { method: 'PUT', body: { month: month.value, prices } })
    notify('Prix, EV et modifications enregistrés avec succès')
  } catch (e: any) {
    notify(e?.statusMessage || "Erreur lors de l'enregistrement", true)
  }
}

function prefill() {
  rows.value.forEach((r) => {
    if (!r.value && r.previous != null) r.value = String(r.previous)
  })
  notify('Prix pré-remplis avec le mois précédent')
}

async function addProduct() {
  try {
    await $fetch('/api/admin/products', {
      method: 'POST',
      body: { ...newProduct, releaseDate: newProduct.releaseDate || null }
    })
    newProduct.name = ''
    notify('Boîte ajoutée avec succès')
    await load()
  } catch (e: any) {
    notify(e?.statusMessage || 'Erreur lors de la création', true)
  }
}

async function deleteProduct(id: number, name: string) {
  if (!confirm(`Supprimer définitivement la boîte "${name}" et son historique ?`)) return
  try {
    await $fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    rows.value = rows.value.filter((r) => r.id !== id)
    notify(`"${name}" supprimé`)
  } catch (e: any) {
    notify(e?.statusMessage || 'Erreur de suppression', true)
  }
}

function applyBulkPaste() {
  if (!bulkText.value.trim()) return
  const lines = bulkText.value.split(/\r?\n/)
  let matched = 0

  for (const line of lines) {
    // Découpe par tabulation, point-virgule ou deux-points
    const parts = line.split(/[\t;:]/).map((s) => s.trim())
    if (parts.length < 2) continue
    const namePart = parts[0].toLowerCase()
    const pricePart = Number(parts[1].replace(',', '.').replace(/[^\d.]/g, ''))
    if (!namePart || !Number.isFinite(pricePart)) continue

    const target = rows.value.find((r) => r.name.toLowerCase() === namePart || r.name.toLowerCase().includes(namePart))
    if (target) {
      target.value = String(pricePart)
      matched++
    }
  }

  bulkText.value = ''
  showBulkPaste.value = false
  notify(`${matched} prix appliqués depuis le copier-coller ! Pensez à enregistrer.`)
}

const searchUrl = (name: string, type: string) => {
  return `https://www.cardmarket.com/fr/Magic/Products/Search?searchString=${encodeURIComponent(`${name} Booster Box`).replace(/%20/g, '+')}`
}

const diff = (r: { previous: number | null; value: string }) => {
  const v = Number(r.value.replace(',', '.'))
  if (!r.value || r.previous == null || !r.previous) return null
  return ((v - r.previous) / r.previous) * 100
}

const isAnomaly = (r: { previous: number | null; value: string }) => {
  const d = diff(r)
  return d != null && (d > 100 || d < -50)
}

const anomaliesCount = computed(() => {
  return rows.value.filter(isAnomaly).length
})

const onlyAnomalies = ref(false)

const filteredRows = computed(() => {
  const q = searchFilter.value.toLowerCase().trim()
  return rows.value.filter((r) => {
    const matchType = typeFilter.value === 'ALL' || r.type === typeFilter.value
    const matchName = !q || r.name.toLowerCase().includes(q)
    const matchAnomaly = !onlyAnomalies.value || isAnomaly(r)
    return matchType && matchName && matchAnomaly
  })
})

watch(month, () => me.value?.admin && load())
onMounted(() => me.value?.admin && load())

useSeoMeta({
  title: 'Admin | MTG Stats',
  robots: 'noindex, nofollow'
})
</script>

<template>
  <div v-if="!me?.admin" class="card login">
    <h1>Connexion admin</h1>
    <input id="password" v-model="password" type="password" class="input" placeholder="Mot de passe" @keyup.enter="login" />
    <button class="btn" @click="login">Se connecter</button>
  </div>

  <template v-else>
    <section class="hero" style="display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap">
      <div>
        <h1>Administration & Prix</h1>
        <p>Gérez les boîtes de boosters, synchronisez le Google Sheet ou renseignez vos prix.</p>
      </div>
      <button class="btn ghost" @click="logout">Se déconnecter</button>
    </section>

    <!-- Importation / Synchronisation directe Cardmarket -->
    <div class="card" style="margin:20px 0; border-color: rgba(91, 141, 239, 0.4);">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
        <h3 style="display:flex; align-items:center; gap:8px;">
          <span>Synchronisation directe Cardmarket (Catalogue & Prix)</span>
        </h3>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <a
            href="https://downloads.s3.cardmarket.com/productCatalog/productList/products_nonsingles_1.json"
            target="_blank"
            rel="noopener noreferrer"
            class="badge"
            style="background: rgba(91, 141, 239, 0.15); color: var(--accent); text-decoration:none;"
            title="Télécharger le catalogue brut S3"
          >
            Fichier Produits S3 ↗
          </a>
          <a
            href="https://downloads.s3.cardmarket.com/productCatalog/priceGuide/price_guide_1.json"
            target="_blank"
            rel="noopener noreferrer"
            class="badge"
            style="background: rgba(91, 141, 239, 0.15); color: var(--accent); text-decoration:none;"
            title="Télécharger le guide des prix brut S3"
          >
            Fichier Prix S3 ↗
          </a>
        </div>
      </div>
      <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 14px; line-height: 1.5;">
        Cardmarket publie quotidiennement ses données sur son CDN public Amazon S3.<br />
        Vous pouvez <strong>lancer la synchronisation directement en 1 clic</strong> (notre serveur télécharge et applique les données sans que vous n'ayez rien à manipuler) ou envoyer vos propres fichiers.
      </p>

      <!-- Paramètres du mois & champ de prix -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:12px; margin-bottom:14px;">
        <div>
          <label style="display:block; font-size:0.75rem; color:var(--muted); margin-bottom:4px;">Mois cible pour les prix</label>
          <input v-model="cmMonth" type="month" class="input" style="width:100%;" />
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; color:var(--muted); margin-bottom:4px;">Indicateur de prix</label>
          <select v-model="cmPriceField" class="input" style="width:100%;">
            <option value="trend">Prix de tendance (TrendPrice - Recommandé)</option>
            <option value="low">Prix le plus bas (LowPrice)</option>
            <option value="avg">Prix moyen de vente (AvgSell)</option>
          </select>
        </div>
        <div style="display:flex; align-items:flex-end;">
          <button
            class="btn"
            style="width:100%; padding:10px 16px; font-weight:600;"
            :disabled="cmSyncingDirect"
            @click="syncCardmarketDirectly"
          >
            {{ cmSyncingDirect ? 'Synchronisation en cours...' : '⚡ Synchroniser Cardmarket (1 clic)' }}
          </button>
        </div>
      </div>

      <!-- Optionnel : Import manuel de fichiers -->
      <details style="margin-top:10px; border-top:1px solid var(--border); padding-top:12px;">
        <summary style="font-size:0.8rem; color:var(--muted); cursor:pointer;">
          Ou téléverser des fichiers manuellement (.json, .csv, .csv.gz)
        </summary>
        <div style="margin-top:10px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept=".json,.csv,.gz,.csv.gz"
            class="input"
            style="padding:6px; flex:1; min-width:220px;"
            @change="onCmFileChange"
          />
          <button
            class="btn ghost"
            :disabled="cmUploading || !cmFiles.length"
            @click="uploadCardmarketFiles"
          >
            {{ cmUploading ? 'Import en cours...' : 'Importer les fichiers' }}
          </button>
        </div>
        <div v-if="cmFiles.length" style="font-size:0.75rem; color:var(--muted); margin-top:6px;">
          {{ cmFiles.length }} fichier(s) sélectionné(s) : {{ cmFiles.map(f => f.name).join(', ') }}
        </div>
      </details>
    </div>

    <!-- Synchronisation Google Sheet -->
    <div class="card" style="margin:20px 0; border-color: rgba(91, 141, 239, 0.3);">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
        <h3 style="display:flex; align-items:center; gap:8px;">
          <span>Synchronisation automatique Google Sheets</span>
        </h3>
        <span class="badge" style="background: rgba(91, 141, 239, 0.2); color: var(--accent);">4 onglets : DRAFT, SET, PLAY, COLLECTOR</span>
      </div>
      <p style="color: var(--muted); font-size: 0.85rem; margin-bottom: 14px;">
        Récupère automatiquement toutes les boîtes scellées avec leur catégorie exacte (Draft, Set, Play, Collector) et l'ensemble des colonnes de prix mensuels du tableau.
      </p>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <input v-model="sheetUrl" class="input grow" placeholder="URL du Google Sheet" />
        <button class="btn" :disabled="syncingSheet" @click="syncGoogleSheet">
          {{ syncingSheet ? 'Synchronisation en cours...' : 'Synchroniser depuis le Google Sheet' }}
        </button>
      </div>
    </div>

    <!-- Outil d'ajout rapide & Copier-coller -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 16px; margin-bottom: 20px;">
      <!-- Nouveau produit -->
      <div class="card">
        <h3 style="margin-bottom:12px">Ajouter une boîte</h3>
        <div style="display:grid; gap:10px;">
          <input v-model="newProduct.name" class="input" placeholder="Nom de l'édition (ex: Modern Horizons 3)" />
          <div style="display:flex; gap:10px;">
            <select v-model="newProduct.type" class="input" style="flex:1;">
              <option value="DRAFT">DRAFT</option>
              <option value="SET">SET</option>
              <option value="PLAY">PLAY</option>
              <option value="COLLECTOR">COLLECTOR</option>
              <option value="OTHER">AUTRES</option>
            </select>
            <input v-model="newProduct.releaseDate" type="date" class="input" style="flex:1;" />
          </div>
          <button class="btn" :disabled="!newProduct.name.trim()" @click="addProduct">Ajouter la boîte</button>
        </div>
      </div>

      <!-- Import rapide copier-coller -->
      <div class="card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <h3>Import rapide (copier-coller)</h3>
          <button class="btn ghost" style="padding:4px 10px; font-size:0.8rem;" @click="showBulkPaste = !showBulkPaste">
            {{ showBulkPaste ? 'Fermer' : 'Ouvrir' }}
          </button>
        </div>
        <p style="color:var(--muted); font-size:0.85rem; margin-bottom:10px;">
          Collez une liste depuis Excel ou un tableur (ex: <code>Édition [TAB] Prix</code>) pour remplir la grille instantanément.
        </p>
        <div v-if="showBulkPaste" style="display:grid; gap:8px;">
          <textarea
            v-model="bulkText"
            class="input"
            rows="4"
            placeholder="Ravnica Allegiance	125&#10;Modern Horizons 2	291&#10;Kamigawa: Neon Dynasty	190"
            style="resize:vertical; font-family:monospace; font-size:0.85rem;"
          ></textarea>
          <button class="btn" :disabled="!bulkText.trim()" @click="applyBulkPaste">Appliquer à la grille</button>
        </div>
      </div>
    </div>

    <!-- Filtres & Actions grille -->
    <div class="toolbar" style="align-items:center;">
      <input id="month" v-model="month" type="month" class="input" title="Mois de saisie" />
      <input v-model="searchFilter" class="input" placeholder="Filtrer par nom..." style="min-width:180px;" />
      <div class="chips">
        <button
          v-for="t in TYPES"
          :key="t.v"
          class="chip"
          :class="{ active: typeFilter === t.v }"
          @click="typeFilter = t.v"
        >
          {{ t.l }}
        </button>
        <button
          v-if="anomaliesCount > 0"
          class="chip"
          :class="{ active: onlyAnomalies }"
          style="border-color: rgba(229, 96, 79, 0.5); color: #e5604f; display: inline-flex; align-items: center; gap: 4px;"
          title="Afficher uniquement les boîtes dont la variation est supérieure à +100% ou inférieure à -50%"
          @click="onlyAnomalies = !onlyAnomalies"
        >
          <span>⚠️ {{ anomaliesCount }} anomalie(s)</span>
        </button>
      </div>
      <div style="margin-left:auto; display:flex; gap:8px; flex-wrap:wrap;">
        <button class="btn ghost" :disabled="syncingEv" title="Récupère les Expected Values calculées depuis Dawnglare / TCG" @click="syncEv">
          {{ syncingEv ? 'Synchro EV...' : 'Synchroniser EV' }}
        </button>
        <button class="btn ghost" @click="prefill">Pré-remplir avec mois précédent</button>
        <button class="btn" @click="save">Enregistrer</button>
      </div>
    </div>

    <!-- Tableau de saisie -->
    <div class="card table-wrap">
      <div v-if="loading" style="text-align:center; padding:40px; color:var(--muted);">Chargement des boîtes...</div>
      <table v-else class="admin-table">
        <colgroup>
          <col />
          <col style="width: 86px;" />
          <col style="width: 114px;" />
          <col style="width: 78px;" />
          <col style="width: 82px;" />
          <col style="width: 82px;" />
          <col style="width: 70px;" />
          <col style="width: 130px;" />
          <col style="width: 36px;" />
        </colgroup>
        <thead>
          <tr>
            <th>Édition</th>
            <th>Type</th>
            <th>Date sortie</th>
            <th class="num">Mois préc.</th>
            <th class="num">Prix (€)</th>
            <th class="num">EV (€)</th>
            <th class="num">Var.</th>
            <th>Cardmarket</th>
            <th style="text-align: center;"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in filteredRows" :key="r.id">
            <!-- Édition -->
            <td style="font-weight: 600; white-space: normal; word-break: break-word;" :title="r.name">
              {{ r.name }}
            </td>

            <!-- Type -->
            <td>
              <select v-model="r.type" class="input" style="padding: 3px 4px; font-size: 0.72rem; width: 100%; box-sizing: border-box;">
                <option value="DRAFT">Draft</option>
                <option value="SET">Set</option>
                <option value="PLAY">Play</option>
                <option value="COLLECTOR">Collector</option>
                <option value="OTHER">Autres</option>
              </select>
            </td>

            <!-- Date de sortie -->
            <td>
              <input
                v-model="r.releaseDate"
                type="date"
                class="input"
                style="padding: 2px 4px; font-size: 0.7rem; width: 100%; color-scheme: dark; box-sizing: border-box;"
                title="Date de sortie de l'édition"
              />
            </td>

            <!-- Mois précédent -->
            <td class="num muted" style="font-weight: 500; font-size: 0.78rem;">
              {{ r.previous != null && !isNaN(r.previous) ? r.previous + ' €' : '-' }}
            </td>

            <!-- Prix du mois -->
            <td class="num">
              <div style="display: flex; align-items: center; gap: 2px; justify-content: flex-end;">
                <input
                  v-model="r.value"
                  class="input admin-input"
                  inputmode="decimal"
                  placeholder="—"
                  style="width: 52px; padding: 3px 5px; text-align: right; font-weight: 600; font-size: 0.78rem;"
                />
                <span style="font-size: 0.75rem; color: var(--muted); font-weight: 600;">€</span>
              </div>
            </td>

            <!-- Expected Value (EV) -->
            <td class="num">
              <div style="display: flex; align-items: center; gap: 2px; justify-content: flex-end;">
                <input
                  v-model="r.evValue"
                  class="input admin-input"
                  inputmode="decimal"
                  placeholder="—"
                  style="width: 52px; padding: 3px 5px; text-align: right; font-weight: 600; color: #7aa7ff; font-size: 0.78rem;"
                  title="Expected Value (valeur estimée du contenu scellé)"
                />
                <span style="font-size: 0.75rem; color: var(--muted); font-weight: 600;">€</span>
              </div>
            </td>

            <!-- Variation -->
            <td class="num">
              <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                <span
                  v-if="isAnomaly(r)"
                  title="Variation suspecte (> +100% ou < -50%)"
                  style="font-size: 0.72rem; cursor: help;"
                >
                  ⚠️
                </span>
                <span class="tag-var" :class="diff(r) == null ? 'muted' : diff(r)! >= 0 ? 'up' : 'down'" style="font-size: 0.7rem; padding: 2px 4px;">
                  {{ diff(r) == null ? '-' : (diff(r)! > 0 ? '+' : '') + diff(r)!.toFixed(1).replace('.', ',') + '%' }}
                </span>
              </div>
            </td>

            <!-- Cardmarket -->
            <td>
              <div style="display: flex; align-items: center; gap: 4px;">
                <a
                  class="cm-link"
                  :href="r.cardmarketUrl || searchUrl(r.name, r.type)"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="font-size: 0.7rem; padding: 2px 5px; white-space: nowrap; flex-shrink: 0;"
                >
                  Voir ↗
                </a>
                <input
                  v-model="r.cardmarketUrl"
                  class="input"
                  style="padding: 2px 4px; font-size: 0.7rem; width: 100%; min-width: 0;"
                  placeholder="URL manuelle"
                  title="URL directe optionnelle si différente"
                />
              </div>
            </td>

            <!-- Action de suppression -->
            <td style="text-align: center;">
              <button
                class="btn ghost"
                style="padding: 2px 5px; font-size: 0.72rem; border-color: transparent; color: var(--down);"
                title="Supprimer cette boîte"
                @click="deleteProduct(r.id, r.name)"
              >
                ✕
              </button>
            </td>
          </tr>
          <tr v-if="!filteredRows.length">
            <td colspan="9" class="muted" style="text-align: center; padding: 40px;">
              Aucune boîte trouvée. Cliquez sur <strong>"Synchroniser Cardmarket"</strong> ou <strong>"Synchroniser depuis le Google Sheet"</strong> !
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>

  <div v-if="toast" class="toast" :class="{ error: toast.error }">{{ toast.msg }}</div>
</template>
