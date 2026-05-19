/**
 * Composable / usePlaceOrder — Command (CQRS) + Saga.
 * Places an order: sends data through the repository,
 * emits the OrderPlaced event — which other contexts react to.
 * The cart-saga plugin listens to OrderPlaced and clears the cart.
 */

import type { CartItem } from '#layers/cart'
import type { Order, OrderItem } from '../../domain/order.model'
import { OrderEvents } from '../../domain/order.events'

export type PlaceOrderError =
  | { code: 'VALIDATION_ERROR'; message: string }
  | { code: 'NETWORK_ERROR' }

export function usePlaceOrder() {
  const { $orderRepo } = useNuxtApp()
  const events = useEvents()
  const loading = ref(false)
  const error = ref<PlaceOrderError | null>(null)

  const errorMessage = computed(() => {
    if (!error.value) return null
    if (error.value.code === 'VALIDATION_ERROR') return error.value.message
    return 'Failed to place order. Please try again.'
  })

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
      events.emit(OrderEvents.OrderPlaced, order)
      return order
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode
      if (statusCode === 422) {
        const message = (err as { data?: { message?: string } }).data?.message ?? 'Invalid order'
        error.value = { code: 'VALIDATION_ERROR', message }
      } else {
        error.value = { code: 'NETWORK_ERROR' }
      }
      return null
    } finally {
      loading.value = false
    }
  }

  return { execute, loading, error, errorMessage }
}
