/**
 * Root Nuxt 4 config.
 * Connects modules. Layers from the layers/ directory are registered automatically.
 */

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  runtimeConfig: {
    public: {
      /** Adapter switching: 'real' (default) or 'fake' */
      adapterMode: 'real',
    },
  },
})
