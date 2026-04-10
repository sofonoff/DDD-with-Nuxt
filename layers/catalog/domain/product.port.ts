/**
 * Catalog domain port — repository contract.
 * Defines WHAT is needed, but not HOW to get it.
 * Implementations (adapter, fake) are in infrastructure/.
 */

import type { Product } from './product.model'

export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product>
}
