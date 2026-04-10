/**
 * Server-side order storage (in-memory).
 * Shared state between GET and POST handlers.
 */

export const orders: Array<{
  id: string
  items: Array<{ productId: string; productName: string; price: number; quantity: number }>
  status: string
  total: number
  createdAt: string
}> = []

export const nextId = { value: 1 }
