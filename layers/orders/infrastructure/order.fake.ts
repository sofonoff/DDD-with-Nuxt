/**
 * Фейк — реализация OrderRepository в памяти.
 * Генерирует заказы локально без сервера.
 */

import type { Order, OrderItem } from '../domain/order.model'
import type { OrderRepository } from '../domain/order.port'

let nextId = 1
const orders: Order[] = []

export function createOrderFake(): OrderRepository {
  return {
    async getAll() {
      return orders
    },
    async getById(id: string) {
      const order = orders.find((o) => o.id === id)
      if (!order) throw new Error(`Order ${id} not found`)
      return order
    },
    async place(items: OrderItem[]) {
      const order: Order = {
        id: String(nextId++),
        items,
        status: 'pending',
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        createdAt: new Date().toISOString(),
      }
      orders.push(order)
      return order
    },
  }
}
