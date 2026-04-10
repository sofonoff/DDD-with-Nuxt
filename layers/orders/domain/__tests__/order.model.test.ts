/**
 * Тесты доменной модели Order.
 */

import { describe, it, expect } from 'vitest'
import { createOrder, canCancel } from '../order.model'
import type { Order, OrderItem } from '../order.model'

const items: OrderItem[] = [
  { productId: '1', productName: 'Headphones', price: 299.99, quantity: 1 },
  { productId: '2', productName: 'Keyboard', price: 149.99, quantity: 2 },
]

describe('order.model', () => {
  it('createOrder calculates total from items', () => {
    const order = createOrder(items)
    expect(order.total).toBeCloseTo(599.97) // 299.99 + 149.99*2
    expect(order.status).toBe('pending')
    expect(order.items).toHaveLength(2)
  })

  it('canCancel returns true for pending orders', () => {
    const order: Order = {
      id: '1', items, status: 'pending', total: 599.97, createdAt: '2026-01-01',
    }
    expect(canCancel(order)).toBe(true)
  })

  it('canCancel returns true for confirmed orders', () => {
    const order: Order = {
      id: '1', items, status: 'confirmed', total: 599.97, createdAt: '2026-01-01',
    }
    expect(canCancel(order)).toBe(true)
  })

  it('canCancel returns false for shipped orders', () => {
    const order: Order = {
      id: '1', items, status: 'shipped', total: 599.97, createdAt: '2026-01-01',
    }
    expect(canCancel(order)).toBe(false)
  })

  it('canCancel returns false for delivered orders', () => {
    const order: Order = {
      id: '1', items, status: 'delivered', total: 599.97, createdAt: '2026-01-01',
    }
    expect(canCancel(order)).toBe(false)
  })
})
