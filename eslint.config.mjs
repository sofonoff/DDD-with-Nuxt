/**
 * ESLint config with rules for bounded context boundaries.
 * Prohibits direct imports from another context's domain/ and infrastructure/.
 * Allowed methods: index.ts (types/events) and composables (auto-import).
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
            message: 'Do not import from another context\'s domain/ directly. Use the context\'s index.ts or composable.',
          },
          {
            group: ['**/layers/*/infrastructure/*'],
            message: 'Do not import from another context\'s infrastructure/ directly. Adapters are connected only through providers.ts.',
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
      // Within own context — importing own domain/ and infrastructure/ is allowed
      'no-restricted-imports': 'off',
    },
  },
)
