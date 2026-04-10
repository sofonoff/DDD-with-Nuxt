/**
 * Порт домена Cart — контракт репозитория.
 * Абстракция для сохранения/загрузки состояния корзины.
 * В реальном проекте: localStorage, API, или IndexedDB.
 */

import type { Cart } from './cart.model'

export interface CartRepository {
  load(): Promise<Cart>
  save(cart: Cart): Promise<void>
}
