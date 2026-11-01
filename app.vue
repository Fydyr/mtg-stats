<script setup lang="ts">
const route = useRoute()
const isMobileMenuOpen = ref(false)

// Ferme automatiquement le menu mobile lors d'un changement de page
watch(() => route.path, () => {
  isMobileMenuOpen.value = false
})

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}
</script>

<template>
  <div class="app-layout">
    <header class="site-header">
      <div class="container header-container" :class="{ 'container-fluid': route.path.startsWith('/admin') }">
        <NuxtLink to="/" class="brand" @click="isMobileMenuOpen = false">
          <span class="brand-logo-wrap">
            <img src="/logo.svg" alt="MTG Stats" class="brand-logo" width="22" height="22" />
          </span>
          <span>MTG Stats</span>
        </NuxtLink>

        <!-- Navigation Bureau -->
        <nav class="nav desktop-nav">
          <NuxtLink to="/" :class="{ 'nav-active': route.path === '/' }">
            <Papicon name="Home" :size="16" />
            <span>Accueil</span>
          </NuxtLink>
          <NuxtLink to="/boxes" :class="{ 'nav-active': route.path.startsWith('/boxes') || route.path.startsWith('/boites') }">
            <Papicon name="Archive" :size="16" />
            <span>Boîtes</span>
          </NuxtLink>
          <NuxtLink to="/boosters" :class="{ 'nav-active': route.path.startsWith('/boosters') }">
            <Papicon name="Card" :size="16" />
            <span>Boosters</span>
          </NuxtLink>
          <NuxtLink to="/decks" :class="{ 'nav-active': route.path.startsWith('/decks') }">
            <Papicon name="Crown" :size="16" />
            <span>Decks</span>
          </NuxtLink>
          <NuxtLink to="/compare" :class="{ 'nav-active': route.path.startsWith('/compare') }">
            <Papicon name="Pillar" :size="16" />
            <span>Comparateur</span>
          </NuxtLink>
          <NuxtLink to="/market" :class="{ 'nav-active': route.path.startsWith('/market') }">
            <Papicon name="Pie" :size="16" />
            <span>Tendances</span>
          </NuxtLink>
          <NuxtLink to="/admin" :class="{ 'nav-active': route.path.startsWith('/admin') }">
            <Papicon name="Gears" :size="16" />
            <span>Admin</span>
          </NuxtLink>
        </nav>

        <!-- Bouton Menu Mobile avec Papicon -->
        <button
          class="mobile-menu-btn"
          :class="{ open: isMobileMenuOpen }"
          aria-label="Menu de navigation"
          :aria-expanded="isMobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <Papicon :name="isMobileMenuOpen ? 'Cross' : 'Menu'" :size="20" />
        </button>
      </div>
    </header>

    <!-- Tiroir / Menu Mobile -->
    <Teleport to="body">
      <Transition name="mobile-menu">
        <div v-if="isMobileMenuOpen" class="mobile-drawer">
          <div class="mobile-drawer-backdrop" @click="isMobileMenuOpen = false"></div>
          <div class="mobile-drawer-content">
            <nav class="mobile-nav">
              <NuxtLink to="/" :class="{ 'mobile-nav-active': route.path === '/' }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Home" :size="18" /></span>
                <span>Accueil</span>
              </NuxtLink>
              <NuxtLink to="/boxes" :class="{ 'mobile-nav-active': route.path.startsWith('/boxes') || route.path.startsWith('/boites') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Archive" :size="18" /></span>
                <span>Boîtes de boosters</span>
              </NuxtLink>
              <NuxtLink to="/boosters" :class="{ 'mobile-nav-active': route.path.startsWith('/boosters') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Card" :size="18" /></span>
                <span>Boosters individuels</span>
              </NuxtLink>
              <NuxtLink to="/decks" :class="{ 'mobile-nav-active': route.path.startsWith('/decks') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Crown" :size="18" /></span>
                <span>Decks préconstruits</span>
              </NuxtLink>
              <NuxtLink to="/compare" :class="{ 'mobile-nav-active': route.path.startsWith('/compare') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Pillar" :size="18" /></span>
                <span>Comparateur</span>
              </NuxtLink>
              <NuxtLink to="/market" :class="{ 'mobile-nav-active': route.path.startsWith('/market') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Pie" :size="18" /></span>
                <span>Tendances Marché</span>
              </NuxtLink>
              <NuxtLink to="/admin" :class="{ 'mobile-nav-active': route.path.startsWith('/admin') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon"><Papicon name="Gears" :size="18" /></span>
                <span>Administration</span>
              </NuxtLink>
            </nav>
            <div class="mobile-drawer-footer">
              <NuxtLink to="/legal" style="color:var(--muted); font-size:0.85rem; display:inline-flex; align-items:center; gap:5px;" @click="isMobileMenuOpen = false">
                <Papicon name="Info" :size="15" />
                <span>Mentions légales</span>
              </NuxtLink>
              <a href="https://enzo-f.aeroliths.fr" target="_blank" rel="noopener noreferrer" style="color:var(--muted); font-size:0.85rem; display:inline-flex; align-items:center; gap:5px;">
                <span>Portfolio</span>
                <Papicon name="ExternalLink" :size="14" />
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <main class="main-content">
      <div class="container" :class="{ 'container-fluid': route.path.startsWith('/admin') }">
        <NuxtPage />
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-container" :class="{ 'container-fluid': route.path.startsWith('/admin') }">
        <p style="margin:0; display:inline-flex; align-items:center; gap:8px;">
          <Papicon name="Sparkles" :size="16" color="#7aa7ff" />
          <span>MTG Stats · Suivi mensuel des prix des scellés Magic: The Gathering (marché européen)</span>
        </p>
        <div class="footer-links">
          <NuxtLink to="/legal">
            <Papicon name="Info" :size="15" />
            <span>Mentions légales</span>
          </NuxtLink>
          <a href="https://enzo-f.aeroliths.fr" target="_blank" rel="noopener noreferrer">
            <span>Portfolio</span>
            <Papicon name="ExternalLink" :size="14" />
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>
