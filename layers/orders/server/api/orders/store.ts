/**
 * Серверное хранилище заказов (in-memory).
 * Общее состояние между GET и POST хэндлерами.
 */

export const orders: Array<{
  id: string
  items: Array<{ productId: string; productName: string; price: number; quantity: number }>
  status: string
  total: number
  createdAt: string
}> = []

export const nextId = { value: 1 }
