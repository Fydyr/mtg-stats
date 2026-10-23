<script setup lang="ts">
definePageMeta({
  alias: ['/boites']
})

const reqUrl = useRequestURL()
const config = useRuntimeConfig()
const siteUrl = computed(() => reqUrl.origin || (config.public.siteUrl as string) || 'https://mtg-stats.aeroliths.fr')

useSeoMeta({
  title: 'MTG Stats : prix des boîtes de boosters Magic',
  ogTitle: 'MTG Stats : prix des boîtes de boosters Magic',
  description: 'Suivi mensuel des prix des boîtes de boosters scellées Magic: The Gathering (Draft, Set, Play, Collector) sur le marché européen.',
  ogDescription: 'Suivi mensuel des prix des boîtes de boosters scellées Magic: The Gathering (Draft, Set, Play, Collector) sur le marché européen.',
  ogUrl: () => `${siteUrl.value}/boxes`,
  ogType: 'website'
})
</script>

<template>
  <ProductCatalog category="BOOSTER_BOX" />
</template>
