/**
 * Публичное API контекста Orders.
 * Другие контексты импортируют типы и события ТОЛЬКО отсюда.
 * Для логики — используй useOrders() / usePlaceOrder() (авто-импорт Nuxt).
 */

export type { Order, OrderItem, OrderStatus } from './domain/order.model'
export { canCancel } from './domain/order.model'
export type { OrderRepository } from './domain/order.port'
export { OrderEvents } from './domain/order.events'
