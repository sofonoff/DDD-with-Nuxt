/**
 * Orders domain events.
 * Event names that this context can emit.
 * Saga example: cart listens to OrderPlaced and clears the cart.
 */

export const OrderEvents = {
  /** Order placed */
  OrderPlaced: 'orders:OrderPlaced',
  /** Order cancelled */
  OrderCancelled: 'orders:OrderCancelled',
} as const
