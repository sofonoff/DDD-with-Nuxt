/**
 * Composable / useProducts — Query (CQRS).
 * Reads catalog data through the injected repository.
 * Auto-imported by Nuxt, available globally.
 */

import type { Product } from '../../domain/product.model'

export function useProducts() {
  const { $productRepo } = useNuxtApp()
  const products = useState<Product[]>('catalog:products', () => [])
  const current = useState<Product | null>('catalog:current', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      products.value = await $productRepo.getAll()
    } catch {
      error.value = 'Failed to load products'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value = null
    try {
      current.value = await $productRepo.getById(id)
    } catch {
      error.value = 'Product not found'
    } finally {
      loading.value = false
    }
  }

  return { products, current, loading, error, fetchAll, fetchById }
}
