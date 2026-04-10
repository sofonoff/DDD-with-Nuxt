/**
 * Публичное API контекста Catalog.
 * Другие контексты импортируют типы и события ТОЛЬКО отсюда.
 * Для логики — используй composable useProducts() (авто-импорт Nuxt).
 */

export type { Product } from './domain/product.model'
export { isAvailable } from './domain/product.model'
export type { ProductRepository } from './domain/product.port'
export { ProductEvents } from './domain/product.events'
