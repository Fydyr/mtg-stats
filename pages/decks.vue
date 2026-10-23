<script setup lang="ts">
const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'MTG Stats : cote & prix des decks préconstruits Magic',
  ogTitle: 'MTG Stats : cote & prix des decks préconstruits Magic',
  description: 'Suivi de la cote des decks préconstruits Magic: The Gathering (Commander, Challenger, Starter sets) sur le marché européen.',
  ogDescription: 'Suivi de la cote des decks préconstruits Magic: The Gathering (Commander, Challenger, Starter sets) sur le marché européen.',
  ogUrl: () => `${siteUrl.value}/decks`,
  ogType: 'website'
})
</script>

<template>
  <ProductCatalog category="PRECON_DECK" />
</template>
