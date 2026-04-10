/**
 * ESLint конфиг с правилами на границы между bounded contexts.
 * Запрещает импорт из чужого domain/ и infrastructure/ напрямую.
 * Разрешённые способы: index.ts (типы/события) и composables (авто-импорт).
 */

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    name: 'ddd-boundaries',
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/layers/*/domain/*'],
            message: 'Не импортируй из чужого domain/ напрямую. Используй index.ts контекста или composable.',
          },
          {
            group: ['**/layers/*/infrastructure/*'],
            message: 'Не импортируй из чужого infrastructure/ напрямую. Адаптеры подключаются только через providers.ts.',
          },
        ],
      }],
    },
  },
  {
    name: 'ddd-boundaries-allow-own-context',
    files: [
      'layers/catalog/**',
      'layers/cart/**',
      'layers/orders/**',
      'layers/shared/**',
    ],
    rules: {
      // Внутри своего контекста — можно импортировать свой domain/ и infrastructure/
      'no-restricted-imports': 'off',
    },
  },
)
