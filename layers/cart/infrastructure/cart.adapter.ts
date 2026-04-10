/**
 * Адаптер — реализация CartRepository через localStorage.
 * Сохраняет и восстанавливает корзину между сессиями.
 */

import type { Cart } from '../domain/cart.model'
import { emptyCart } from '../domain/cart.model'
import type { CartRepository } from '../domain/cart.port'

const STORAGE_KEY = 'ddd-cart'

export function createCartAdapter(): CartRepository {
  return {
    async load() {
      if (typeof window === 'undefined') return emptyCart()
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : emptyCart()
    },
    async save(cart: Cart) {
      if (typeof window === 'undefined') return
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart))
    },
  }
}
