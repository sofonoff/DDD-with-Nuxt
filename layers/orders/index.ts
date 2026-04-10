/**
 * Public API of the Orders context.
 * Other contexts import types and events ONLY from here.
 * For logic — use useOrders() / usePlaceOrder() (Nuxt auto-import).
 */

export type { Order, OrderItem, OrderStatus } from './domain/order.model'
export { canCancel } from './domain/order.model'
export type { OrderRepository } from './domain/order.port'
export { OrderEvents } from './domain/order.events'
