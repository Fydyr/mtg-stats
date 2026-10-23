<script setup lang="ts">
const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'MTG Stats : prix des boosters individuels Magic',
  ogTitle: 'MTG Stats : prix des boosters individuels Magic',
  description: 'Suivi mensuel des prix des boosters à l\'unité Magic: The Gathering (Draft, Set, Play, Collector) sur le marché européen.',
  ogDescription: 'Suivi mensuel des prix des boosters à l\'unité Magic: The Gathering (Draft, Set, Play, Collector) sur le marché européen.',
  ogUrl: () => `${siteUrl.value}/boosters`,
  ogType: 'website'
})
</script>

<template>
  <ProductCatalog category="SINGLE_BOOSTER" />
</template>
