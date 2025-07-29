import process from 'node:process'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: [
    '@nuxt/ui-pro',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
  ],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true,
  },
  runtimeConfig: {
    admin: {
      email: process.env.NUXT_ADMIN_EMAIL || 'admin@example.com',
      password: process.env.NUXT_ADMIN_PASSWORD || undefined,
    },
  },
})
