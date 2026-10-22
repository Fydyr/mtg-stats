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
        }
      ],
      link: [
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
    syncSecret: ''
  }
})
