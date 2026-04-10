/**
 * Orders domain model — Entity Order + Aggregate.
 * Describes an order, its states, and business rules.
 * Pure TypeScript — no frameworks.
 */

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  createdAt: string
}

/** Creates an order from a set of items */
export function createOrder(items: OrderItem[]): Omit<Order, 'id' | 'createdAt'> {
  return {
    items,
    status: 'pending',
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }
}

/** Whether the order can be cancelled */
export function canCancel(order: Order): boolean {
  return order.status === 'pending' || order.status === 'confirmed'
}
