/**
 * Публичное API контекста Cart.
 * Другие контексты импортируют типы и события ТОЛЬКО отсюда.
 * Для логики — используй composable useCart() (авто-импорт Nuxt).
 */

export type { Cart, CartItem } from './domain/cart.model'
export { cartTotal, cartItemCount } from './domain/cart.model'
export type { CartRepository } from './domain/cart.port'
export { CartEvents } from './domain/cart.events'
