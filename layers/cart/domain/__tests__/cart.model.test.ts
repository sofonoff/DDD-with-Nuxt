/**
 * Tests for the Cart domain model.
 * Pure functions — tested without Vue, Nuxt, or mocks.
 * This is the main advantage of DDD on the frontend: business logic is tested instantly.
 */

import { describe, it, expect } from 'vitest'
import {
  emptyCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  cartTotal,
  cartItemCount,
} from '../cart.model'
import type { CartProduct } from '../cart.model'

const headphones: CartProduct = {
  id: '1',
  name: 'Headphones',
  price: 299.99,
  image: '/img.jpg',
}

const keyboard: CartProduct = {
  id: '2',
  name: 'Keyboard',
  price: 149.99,
  image: '/img.jpg',
}

describe('cart.model', () => {
  it('emptyCart returns empty cart', () => {
    const cart = emptyCart()
    expect(cart.items).toEqual([])
    expect(cartTotal(cart)).toBe(0)
    expect(cartItemCount(cart)).toBe(0)
  })

  it('addToCart adds a new product', () => {
    const cart = addToCart(emptyCart(), headphones)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.product.id).toBe('1')
    expect(cart.items[0]!.quantity).toBe(1)
  })

  it('addToCart increments quantity for existing product', () => {
    let cart = addToCart(emptyCart(), headphones)
    cart = addToCart(cart, headphones)
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.quantity).toBe(2)
  })

  it('addToCart handles multiple products', () => {
    let cart = addToCart(emptyCart(), headphones)
    cart = addToCart(cart, keyboard)
    expect(cart.items).toHaveLength(2)
  })

  it('removeFromCart removes a product', () => {
    let cart = addToCart(emptyCart(), headphones)
    cart = addToCart(cart, keyboard)
    cart = removeFromCart(cart, '1')
    expect(cart.items).toHaveLength(1)
    expect(cart.items[0]!.product.id).toBe('2')
  })

  it('updateQuantity changes quantity', () => {
    let cart = addToCart(emptyCart(), headphones)
    cart = updateQuantity(cart, '1', 5)
    expect(cart.items[0]!.quantity).toBe(5)
  })

  it('updateQuantity removes item when quantity <= 0', () => {
    let cart = addToCart(emptyCart(), headphones)
    cart = updateQuantity(cart, '1', 0)
    expect(cart.items).toHaveLength(0)
  })

  it('cartTotal calculates correct total', () => {
    let cart = addToCart(emptyCart(), headphones) // 299.99
    cart = addToCart(cart, keyboard)               // + 149.99
    cart = addToCart(cart, headphones)             // + 299.99 (qty 2)
    expect(cartTotal(cart)).toBeCloseTo(749.97)
  })

  it('cartItemCount counts all items', () => {
    let cart = addToCart(emptyCart(), headphones)
    cart = addToCart(cart, headphones)
    cart = addToCart(cart, keyboard)
    expect(cartItemCount(cart)).toBe(3) // 2 + 1
  })

  it('operations are immutable — original cart unchanged', () => {
    const original = emptyCart()
    const withItem = addToCart(original, headphones)
    expect(original.items).toHaveLength(0)
    expect(withItem.items).toHaveLength(1)
  })
})
