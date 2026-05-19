/**
 * ESLint config with rules for bounded context boundaries.
 * Each context can import from its own domain/ and infrastructure/.
 * Cross-context access must go through the context's index.ts (public API).
 *
 * Bug in the previous version: `no-restricted-imports: 'off'` for all layer files
 * disabled the rule globally inside each context, so cross-context domain imports
 * were silently allowed. Fixed by per-context rules that restrict only foreign internals.
 */

import withNuxt from './.nuxt/eslint.config.mjs'

const msg = (ctx) => `Use the ${ctx} public API: import from '#layers/${ctx.toLowerCase()}'`

export default withNuxt(
  // cart — cannot reach into catalog or orders internals
  {
    name: 'ddd-cart-boundaries',
    files: ['layers/cart/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/layers/catalog/domain/**', '**/catalog/domain/**'], message: msg('Catalog') },
          { group: ['**/layers/catalog/infrastructure/**', '**/catalog/infrastructure/**'], message: msg('Catalog') },
          { group: ['**/layers/orders/domain/**', '**/orders/domain/**'], message: msg('Orders') },
          { group: ['**/layers/orders/infrastructure/**', '**/orders/infrastructure/**'], message: msg('Orders') },
        ],
      }],
    },
  },

  // catalog — cannot reach into cart or orders internals
  {
    name: 'ddd-catalog-boundaries',
    files: ['layers/catalog/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/layers/cart/domain/**', '**/cart/domain/**'], message: msg('Cart') },
          { group: ['**/layers/cart/infrastructure/**', '**/cart/infrastructure/**'], message: msg('Cart') },
          { group: ['**/layers/orders/domain/**', '**/orders/domain/**'], message: msg('Orders') },
          { group: ['**/layers/orders/infrastructure/**', '**/orders/infrastructure/**'], message: msg('Orders') },
        ],
      }],
    },
  },

  // orders — cannot reach into catalog or cart internals
  {
    name: 'ddd-orders-boundaries',
    files: ['layers/orders/**'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [
          { group: ['**/layers/catalog/domain/**', '**/catalog/domain/**'], message: msg('Catalog') },
          { group: ['**/layers/catalog/infrastructure/**', '**/catalog/infrastructure/**'], message: msg('Catalog') },
          { group: ['**/layers/cart/domain/**', '**/cart/domain/**'], message: msg('Cart') },
          { group: ['**/layers/cart/infrastructure/**', '**/cart/infrastructure/**'], message: msg('Cart') },
        ],
      }],
    },
  },
)
