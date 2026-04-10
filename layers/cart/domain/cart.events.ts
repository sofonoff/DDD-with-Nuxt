/**
 * Cart domain events.
 * Event names that this context can emit.
 */

export const CartEvents = {
  /** Product added to cart */
  ItemAdded: 'cart:ItemAdded',
  /** Product removed from cart */
  ItemRemoved: 'cart:ItemRemoved',
  /** Cart cleared */
  CartCleared: 'cart:CartCleared',
} as const
