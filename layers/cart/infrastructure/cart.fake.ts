/**
 * Фейк — реализация CartRepository в памяти.
 * Для тестов и разработки без localStorage.
 */

import type { Cart } from '../domain/cart.model'
import { emptyCart } from '../domain/cart.model'
import type { CartRepository } from '../domain/cart.port'

export function createCartFake(): CartRepository {
  let stored: Cart = emptyCart()

  return {
    async load() {
      return stored
    },
    async save(cart: Cart) {
      stored = cart
    },
  }
}
