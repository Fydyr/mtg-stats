export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  experimental: {
    appManifest: false
  },
  css: ['~/assets/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'MTG Stats | Suivi des prix des boosters',
      meta: [
        {
          name: 'description',
          content:
            'Suivi mensuel des prix des boosters scellés Magic: The Gathering sur le marché européen : variations, historique et tendances.'
        },
        { name: 'theme-color', content: '#5b8def' },
        { property: 'og:site_name', content: 'MTG Stats' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'shortcut icon', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/logo.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap'
        }
      ]
    }
  },
  runtimeConfig: {
    // Surchargés au runtime par NUXT_ADMIN_PASSWORD / NUXT_SESSION_SECRET
    adminPassword: '',
    sessionSecret: '',
    syncSecret: '',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://mtg-stats.aeroliths.fr'
    }
  }
})
