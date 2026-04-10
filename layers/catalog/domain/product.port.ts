/**
 * Порт домена Catalog — контракт репозитория.
 * Определяет ЧТО нужно, но не КАК это получить.
 * Реализации (adapter, fake) лежат в infrastructure/.
 */

import type { Product } from './product.model'

export interface ProductRepository {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product>
}
