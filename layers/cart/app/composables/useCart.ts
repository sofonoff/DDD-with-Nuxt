/**
 * Composable / useCart — Aggregate.
 * Manages cart state, delegates logic to domain/cart.model.ts.
 * The OrderPlaced → clear saga is handled in cart-saga.ts plugin (once per app instance).
 */

import type { Product } from '#layers/catalog'
import type { Cart, CartProduct } from '#layers/cart'
import {
  emptyCart,
  addToCart,
  removeFromCart,
  updateQuantity as updateQty,
  cartTotal,
  cartItemCount,
} from '../../domain/cart.model'
import { CartEvents } from '#layers/cart'
import { useEvents } from '#layers/shared/app/composables/useEvents'

export function useCart() {
  const { $cartRepo } = useNuxtApp()
  const events = useEvents()
  const cart = useState<Cart>('cart:state', () => emptyCart())

  const items = computed(() => cart.value.items)
  const totalItems = computed(() => cartItemCount(cart.value))
  const totalPrice = computed(() => cartTotal(cart.value))

  /** Save current state to the repository */
  async function persist() {
    await $cartRepo.save(cart.value)
  }

  /** Load cart from the repository */
  async function load() {
    cart.value = await $cartRepo.load()
  }

  function addItem(product: Product) {
    const cartProduct: CartProduct = { id: product.id, name: product.name, price: product.price, image: product.image }
    cart.value = addToCart(cart.value, cartProduct)
    events.emit(CartEvents.ItemAdded, cartProduct)
    persist()
  }

  function removeItem(productId: string) {
    cart.value = removeFromCart(cart.value, productId)
    events.emit(CartEvents.ItemRemoved, productId)
    persist()
  }

  function updateQuantity(productId: string, quantity: number) {
    cart.value = updateQty(cart.value, productId, quantity)
    persist()
  }

  function clear() {
    cart.value = emptyCart()
    events.emit(CartEvents.CartCleared)
    persist()
  }

  return { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clear, load }
}
