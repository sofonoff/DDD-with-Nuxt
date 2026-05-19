/**
 * Registers the OrderPlaced → clear cart saga exactly once per app instance.
 * Previously lived in useCart(), which caused one subscription per component
 * that called useCart() — clear() fired N times per order.
 */

import { emptyCart } from '../domain/cart.model'
import { OrderEvents } from '#layers/orders'
import { CartEvents } from '#layers/cart'

export default defineNuxtPlugin(() => {
  const events = useEvents()
  const cart = useState('cart:state', emptyCart)

  events.on(OrderEvents.OrderPlaced, async () => {
    const { $cartRepo } = useNuxtApp() // lazy — all plugins loaded by the time this fires
    cart.value = emptyCart()
    events.emit(CartEvents.CartCleared)
    await $cartRepo.save(emptyCart())
  })
})
