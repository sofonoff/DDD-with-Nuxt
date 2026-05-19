/**
 * Server API / POST /api/orders — creates a new order.
 * Mock: generates an ID and saves to memory.
 */

import { z } from 'zod'
import { orders, nextId } from './store'

const OrderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
})

const PlaceOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
})

export default defineEventHandler(async (event) => {
  const raw = await readBody(event)
  const result = PlaceOrderSchema.safeParse(raw)

  if (!result.success) {
    throw createError({ statusCode: 422, message: result.error.issues[0]?.message ?? 'Invalid request' })
  }

  const { items } = result.data

  const order = {
    id: String(nextId.value++),
    items,
    status: 'pending' as const,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    createdAt: new Date().toISOString(),
  }

  orders.push(order)
  return order
})
