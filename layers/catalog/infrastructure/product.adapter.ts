/**
 * Адаптер — реализация ProductRepository через HTTP ($fetch).
 * Вызывает реальные серверные эндпоинты.
 * Подключается в app/plugins/providers.ts.
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
