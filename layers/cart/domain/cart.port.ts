/**
 * Cart domain port — repository contract.
 * Abstraction for saving/loading cart state.
 * In a real project: localStorage, API, or IndexedDB.
 */

import type { Cart } from './cart.model'

export interface CartRepository {
  load(): Promise<Cart>
  save(cart: Cart): Promise<void>
}
