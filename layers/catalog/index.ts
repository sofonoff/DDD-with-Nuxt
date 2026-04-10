/**
 * Публичное API контекста Catalog.
 * Другие контексты импортируют ТОЛЬКО отсюда.
 * Не импортируй напрямую из domain/ или infrastructure/ чужого контекста.
 */

export type { Product } from './domain/product.model'
export { isAvailable } from './domain/product.model'
export type { ProductRepository } from './domain/product.port'
export { ProductEvents } from './domain/product.events'
