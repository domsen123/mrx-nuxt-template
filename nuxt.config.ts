// https://nuxt.com/docs/api/configuration/nuxt-config
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
})
