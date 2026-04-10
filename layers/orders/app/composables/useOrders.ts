/**
 * Composable / useOrders — Query (CQRS).
 * Читает список заказов. Не меняет данные — только запрашивает.
 */

import type { Order } from '../../domain/order.model'

export function useOrders() {
  const { $orderRepo } = useNuxtApp()
  const orders = useState<Order[]>('orders:list', () => [])
  const current = useState<Order | null>('orders:current', () => null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      orders.value = await $orderRepo.getAll()
    } catch {
      error.value = 'Не удалось загрузить заказы'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id: string) {
    loading.value = true
    error.value = null
    try {
      current.value = await $orderRepo.getById(id)
    } catch {
      error.value = 'Заказ не найден'
    } finally {
      loading.value = false
    }
  }

  return { orders, current, loading, error, fetchAll, fetchById }
}
