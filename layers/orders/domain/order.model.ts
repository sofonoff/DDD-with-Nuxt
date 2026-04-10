/**
 * Модель домена Orders — Entity Order + Aggregate.
 * Описывает заказ, его состояния и бизнес-правила.
 * Чистый TypeScript — без фреймворков.
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

/** Создаёт заказ из набора позиций */
export function createOrder(items: OrderItem[]): Omit<Order, 'id' | 'createdAt'> {
  return {
    items,
    status: 'pending',
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  }
}

/** Можно ли отменить заказ */
export function canCancel(order: Order): boolean {
  return order.status === 'pending' || order.status === 'confirmed'
}
