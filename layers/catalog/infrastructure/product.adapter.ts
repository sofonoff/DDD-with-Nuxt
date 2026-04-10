/**
 * Adapter — ProductRepository implementation via HTTP ($fetch).
 * Calls real server endpoints.
 * Connected in app/plugins/providers.ts.
 */

import type { Product } from '../domain/product.model'
import type { ProductRepository } from '../domain/product.port'

export function createProductAdapter(): ProductRepository {
  return {
    async getAll() {
      return $fetch<Product[]>('/api/products')
    },
    async getById(id: string) {
      return $fetch<Product>(`/api/products/${id}`)
    },
  }
}
