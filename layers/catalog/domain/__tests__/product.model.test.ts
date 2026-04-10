/**
 * Тесты доменной модели Product.
 */

import { describe, it, expect } from 'vitest'
import { isAvailable } from '../product.model'
import type { Product } from '../product.model'

const product: Product = {
  id: '1',
  name: 'Headphones',
  slug: 'headphones',
  description: 'Wireless headphones',
  price: 299.99,
  image: '/img.jpg',
  category: 'electronics',
}

describe('product.model', () => {
  it('isAvailable returns true for products with positive price', () => {
    expect(isAvailable(product)).toBe(true)
  })

  it('isAvailable returns false for products with zero price', () => {
    expect(isAvailable({ ...product, price: 0 })).toBe(false)
  })

  it('isAvailable returns false for products with negative price', () => {
    expect(isAvailable({ ...product, price: -10 })).toBe(false)
  })
})
