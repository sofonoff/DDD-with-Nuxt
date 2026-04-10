/**
 * Domain Events домена Orders.
 * Имена событий, которые этот контекст может эмитить.
 * Пример Saga: cart слушает OrderPlaced и очищает корзину.
 */

export const OrderEvents = {
  /** Заказ оформлен */
  OrderPlaced: 'orders:OrderPlaced',
  /** Заказ отменён */
  OrderCancelled: 'orders:OrderCancelled',
} as const
