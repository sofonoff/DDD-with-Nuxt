/**
 * Composable / usePlaceOrder — Command (CQRS) + Saga.
 * Оформляет заказ: отправляет данные через репозиторий,
 * эмитит событие OrderPlaced — на которое реагируют другие контексты.
 * Пример Saga: cart слушает OrderPlaced и очищает корзину.
 */

import type { CartItem } from '~~/layers/cart/domain/cart.model'
import type { Order, OrderItem } from '../../domain/order.model'
import { OrderEvents } from '../../domain/order.events'

export function usePlaceOrder() {
  const { $orderRepo } = useNuxtApp()
  const events = useEvents()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Преобразовать CartItem[] в OrderItem[] */
  function toOrderItems(cartItems: CartItem[]): OrderItem[] {
    return cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }))
  }

  async function execute(cartItems: CartItem[]): Promise<Order | null> {
    loading.value = true
    error.value = null
    try {
      const orderItems = toOrderItems(cartItems)
      const order = await $orderRepo.place(orderItems)

      // Saga: эмитим событие — cart подписан и очистит себя
      events.emit(OrderEvents.OrderPlaced, order)

      return order
    } catch {
      error.value = 'Не удалось оформить заказ'
      return null
    } finally {
      loading.value = false
    }
  }

  return { execute, loading, error }
}
