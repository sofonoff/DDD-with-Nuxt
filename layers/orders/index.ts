/**
 * Публичное API контекста Orders.
 * Другие контексты импортируют ТОЛЬКО отсюда.
 */

export type { Order, OrderItem } from './domain/order.model'
export type { OrderRepository } from './domain/order.port'
export { OrderEvents } from './domain/order.events'
