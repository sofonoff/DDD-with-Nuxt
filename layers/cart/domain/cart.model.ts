/**
 * Cart domain model — Aggregate.
 * Describes the cart, its items, and business rules.
 * Pure functions — all logic is tested without Vue or API.
 */

import type { Product } from '../../catalog/domain/product.model'

export interface CartItem {
  product: Product
  quantity: number
}

export interface Cart {
  items: CartItem[]
}

export function emptyCart(): Cart {
  return { items: [] }
}

export function addToCart(cart: Cart, product: Product): Cart {
  const existing = cart.items.find((item) => item.product.id === product.id)
  if (existing) {
    return {
      items: cart.items.map((item) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    }
  }
  return { items: [...cart.items, { product, quantity: 1 }] }
}

export function removeFromCart(cart: Cart, productId: string): Cart {
  return { items: cart.items.filter((item) => item.product.id !== productId) }
}

export function updateQuantity(cart: Cart, productId: string, quantity: number): Cart {
  if (quantity <= 0) return removeFromCart(cart, productId)
  return {
    items: cart.items.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item,
    ),
  }
}

export function cartTotal(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0)
}
