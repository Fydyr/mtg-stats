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
          <img src="/logo.svg" alt="MTG Stats" class="brand-logo" width="24" height="24" />
          <span>MTG Stats</span>
        </NuxtLink>

        <!-- Navigation Bureau -->
        <nav class="nav desktop-nav">
          <NuxtLink to="/" :class="{ 'nav-active': route.path === '/' }">Accueil</NuxtLink>
          <NuxtLink to="/boxes" :class="{ 'nav-active': route.path.startsWith('/boxes') || route.path.startsWith('/boites') }">Boîtes</NuxtLink>
          <NuxtLink to="/boosters" :class="{ 'nav-active': route.path.startsWith('/boosters') }">Boosters</NuxtLink>
          <NuxtLink to="/decks" :class="{ 'nav-active': route.path.startsWith('/decks') }">Decks</NuxtLink>
          <NuxtLink to="/compare" :class="{ 'nav-active': route.path.startsWith('/compare') }">Comparateur</NuxtLink>
          <NuxtLink to="/market" :class="{ 'nav-active': route.path.startsWith('/market') }">Tendances Marché</NuxtLink>
          <NuxtLink to="/admin" :class="{ 'nav-active': route.path.startsWith('/admin') }">Admin</NuxtLink>
        </nav>

        <!-- Bouton Burger Mobile -->
        <button
          class="mobile-menu-btn"
          :class="{ open: isMobileMenuOpen }"
          aria-label="Menu de navigation"
          :aria-expanded="isMobileMenuOpen"
          @click="toggleMobileMenu"
        >
          <span class="burger-bar"></span>
          <span class="burger-bar"></span>
          <span class="burger-bar"></span>
        </button>
      </div>
    </header>

    <!-- Tiroir / Menu Mobile (en dehors du header pour éviter les conflits de stacking) -->
    <Teleport to="body">
      <Transition name="mobile-menu">
        <div v-if="isMobileMenuOpen" class="mobile-drawer">
          <div class="mobile-drawer-backdrop" @click="isMobileMenuOpen = false"></div>
          <div class="mobile-drawer-content">
            <nav class="mobile-nav">
              <NuxtLink to="/" :class="{ 'mobile-nav-active': route.path === '/' }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">🏠</span>
                <span>Accueil</span>
              </NuxtLink>
              <NuxtLink to="/boxes" :class="{ 'mobile-nav-active': route.path.startsWith('/boxes') || route.path.startsWith('/boites') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">📦</span>
                <span>Boîtes de boosters</span>
              </NuxtLink>
              <NuxtLink to="/boosters" :class="{ 'mobile-nav-active': route.path.startsWith('/boosters') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">🃏</span>
                <span>Boosters individuels</span>
              </NuxtLink>
              <NuxtLink to="/decks" :class="{ 'mobile-nav-active': route.path.startsWith('/decks') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">⚔️</span>
                <span>Decks préconstruits</span>
              </NuxtLink>
              <NuxtLink to="/compare" :class="{ 'mobile-nav-active': route.path.startsWith('/compare') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">⚖️</span>
                <span>Comparateur</span>
              </NuxtLink>
              <NuxtLink to="/market" :class="{ 'mobile-nav-active': route.path.startsWith('/market') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">📊</span>
                <span>Tendances Marché</span>
              </NuxtLink>
              <NuxtLink to="/admin" :class="{ 'mobile-nav-active': route.path.startsWith('/admin') }" @click="isMobileMenuOpen = false">
                <span class="nav-icon">⚙️</span>
                <span>Administration</span>
              </NuxtLink>
            </nav>
            <div class="mobile-drawer-footer">
              <NuxtLink to="/legal" style="color:var(--muted); font-size:0.85rem;" @click="isMobileMenuOpen = false">Mentions légales</NuxtLink>
              <a href="https://enzo-f.aeroliths.fr" target="_blank" rel="noopener noreferrer" style="color:var(--muted); font-size:0.85rem;">Portfolio ↗</a>
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
        <p style="margin:0;">MTG Stats · Suivi mensuel des prix des scellés Magic: The Gathering (marché européen)</p>
        <div class="footer-links">
          <NuxtLink to="/legal" style="color:var(--muted); font-size:0.85rem;">Mentions légales</NuxtLink>
          <a href="https://enzo-f.aeroliths.fr" target="_blank" rel="noopener noreferrer" style="color:var(--muted); font-size:0.85rem;">Portfolio ↗</a>
        </div>
      </div>
    </footer>
  </div>
</template>
