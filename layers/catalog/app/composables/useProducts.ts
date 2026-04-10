/**
 * Composable / useProducts — Query (CQRS).
 * Читает данные каталога через инжектированный репозиторий.
 * Автоимпортируется Nuxt, доступен глобально.
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
      error.value = 'Не удалось загрузить товары'
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
      error.value = 'Товар не найден'
    } finally {
      loading.value = false
    }
  }

  return { products, current, loading, error, fetchAll, fetchById }
}
