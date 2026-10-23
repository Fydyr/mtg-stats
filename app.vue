<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div class="app-layout">
    <header class="site-header">
      <div class="container header-container" :class="{ 'container-fluid': route.path.startsWith('/admin') }">
        <NuxtLink to="/" class="brand">
          <img src="/logo.svg" alt="MTG Stats" class="brand-logo" width="24" height="24" />
          <span>MTG Stats</span>
        </NuxtLink>
        <nav class="nav">
          <NuxtLink to="/" :class="{ 'nav-active': route.path === '/' }">Accueil</NuxtLink>
          <NuxtLink to="/boxes" :class="{ 'nav-active': route.path.startsWith('/boxes') || route.path.startsWith('/boites') }">Boîtes</NuxtLink>
          <NuxtLink to="/boosters" :class="{ 'nav-active': route.path.startsWith('/boosters') }">Boosters</NuxtLink>
          <NuxtLink to="/decks" :class="{ 'nav-active': route.path.startsWith('/decks') }">Decks</NuxtLink>
          <NuxtLink to="/market" :class="{ 'nav-active': route.path.startsWith('/market') }">Tendances Marché</NuxtLink>
          <NuxtLink to="/admin" :class="{ 'nav-active': route.path.startsWith('/admin') }">Admin</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="main-content">
      <div class="container" :class="{ 'container-fluid': route.path.startsWith('/admin') }">
        <NuxtPage />
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-container" :class="{ 'container-fluid': route.path.startsWith('/admin') }">
        <p>MTG Stats · Suivi mensuel des prix des boosters scellés Magic: The Gathering (marché européen)</p>
      </div>
    </footer>
  </div>
</template>
