/**
 * Public API of the Cart context.
 * Other contexts import types and events ONLY from here.
 * For logic — use the useCart() composable (Nuxt auto-import).
 */

export type { Cart, CartItem } from './domain/cart.model'
export { cartTotal, cartItemCount } from './domain/cart.model'
export type { CartRepository } from './domain/cart.port'
export { CartEvents } from './domain/cart.events'
