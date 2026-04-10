/**
 * Domain Events домена Cart.
 * Имена событий, которые этот контекст может эмитить.
 */

export const CartEvents = {
  /** Товар добавлен в корзину */
  ItemAdded: 'cart:ItemAdded',
  /** Товар удалён из корзины */
  ItemRemoved: 'cart:ItemRemoved',
  /** Корзина очищена */
  CartCleared: 'cart:CartCleared',
} as const
