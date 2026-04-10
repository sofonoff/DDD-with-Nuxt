/**
 * Корневой конфиг Nuxt 4.
 * Подключает модули. Layers из папки layers/ регистрируются автоматически.
 */

export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  runtimeConfig: {
    public: {
      /** Переключение адаптеров: 'real' (по умолчанию) или 'fake' */
      adapterMode: 'real',
    },
  },
})
