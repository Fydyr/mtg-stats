<template>
  <div>
    <header class="site-header">
      <div class="container">
        <NuxtLink to="/" class="brand"><span class="brand-dot" />MTG Stats</NuxtLink>
        <nav class="nav">
          <NuxtLink to="/">Boosters</NuxtLink>
          <NuxtLink to="/admin">Admin</NuxtLink>
        </nav>
      </div>
    </header>
    <main class="container">
      <NuxtPage />
    </main>
    <footer>MTG Stats : suivi mensuel des prix des boosters scellés (marché européen)</footer>
  </div>
</template>
