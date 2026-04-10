/**
 * Composable / usePlaceOrder — Command (CQRS) + Saga.
 * Places an order: sends data through the repository,
 * emits the OrderPlaced event — which other contexts react to.
 * Saga example: cart listens to OrderPlaced and clears the cart.
 */

import type { CartItem } from '~~/layers/cart/domain/cart.model'
import type { Order, OrderItem } from '../../domain/order.model'
import { OrderEvents } from '../../domain/order.events'

export function usePlaceOrder() {
  const { $orderRepo } = useNuxtApp()
  const events = useEvents()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /** Convert CartItem[] to OrderItem[] */
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

      // Saga: emit event — cart is subscribed and will clear itself
      events.emit(OrderEvents.OrderPlaced, order)

      return order
    } catch {
      error.value = 'Failed to place order'
      return null
    } finally {
      loading.value = false
    }
  }

  return { execute, loading, error }
}
