/**
 * Адаптер — реализация OrderRepository через HTTP ($fetch).
 * Вызывает серверные эндпоинты для работы с заказами.
 */

import type { Order, OrderItem } from '../domain/order.model'
import type { OrderRepository } from '../domain/order.port'

export function createOrderAdapter(): OrderRepository {
  return {
    async getAll() {
      return $fetch<Order[]>('/api/orders')
    },
    async getById(id: string) {
      return $fetch<Order>(`/api/orders/${id}`)
    },
    async place(items: OrderItem[]) {
      return $fetch<Order>('/api/orders', {
        method: 'POST',
        body: { items },
      })
    },
  }
}
