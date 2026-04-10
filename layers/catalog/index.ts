/**
 * Public API of the Catalog context.
 * Other contexts import types and events ONLY from here.
 * For logic — use the useProducts() composable (Nuxt auto-import).
 */

export type { Product } from './domain/product.model'
export { isAvailable } from './domain/product.model'
export type { ProductRepository } from './domain/product.port'
export { ProductEvents } from './domain/product.events'
