/**
 * Orders domain port — repository contract.
 * Defines operations with orders.
 * Implementations (adapter, fake) are in infrastructure/.
 */

import type { Order, OrderItem } from './order.model'

export interface OrderRepository {
  getAll(): Promise<Order[]>
  getById(id: string): Promise<Order>
  place(items: OrderItem[]): Promise<Order>
}
