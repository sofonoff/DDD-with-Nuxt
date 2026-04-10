/**
 * Конфиг shared layer.
 * Регистрирует папку app/components/ui как источник компонентов с префиксом Ui.
 */

export default defineNuxtConfig({
  components: [
    { path: 'components/ui', prefix: 'Ui' },
  ],
})
