/**
 * Server API / POST /api/orders — creates a new order.
 * Mock: generates an ID and saves to memory.
 */

import { orders, nextId } from './store'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const order = {
    id: String(nextId.value++),
    items: body.items,
    status: 'pending' as const,
    total: body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0,
    ),
    createdAt: new Date().toISOString(),
  }

  orders.push(order)
  return order
})
