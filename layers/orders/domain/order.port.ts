/**
 * Порт домена Orders — контракт репозитория.
 * Определяет операции с заказами.
 * Реализации (adapter, fake) лежат в infrastructure/.
 */

import type { Order, OrderItem } from './order.model'

export interface OrderRepository {
  getAll(): Promise<Order[]>
  getById(id: string): Promise<Order>
  place(items: OrderItem[]): Promise<Order>
}
