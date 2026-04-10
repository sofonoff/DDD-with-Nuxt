/**
 * Fake — ProductRepository implementation with hardcoded data.
 * For development without a backend and for tests.
 * Substituted in providers.ts instead of the real adapter.
 */

import type { Product } from '../domain/product.model'
import type { ProductRepository } from '../domain/product.port'

const fakeProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
    description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
    price: 299.99,
    image: 'https://picsum.photos/seed/headphones/400/300',
    category: 'electronics',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    slug: 'mechanical-keyboard',
    description: 'RGB mechanical keyboard with Cherry MX switches and aluminum frame.',
    price: 149.99,
    image: 'https://picsum.photos/seed/keyboard/400/300',
    category: 'electronics',
  },
  {
    id: '3',
    name: 'Running Shoes',
    slug: 'running-shoes',
    description: 'Lightweight running shoes with responsive cushioning for long-distance comfort.',
    price: 129.99,
    image: 'https://picsum.photos/seed/shoes/400/300',
    category: 'sportswear',
  },
  {
    id: '4',
    name: 'Backpack',
    slug: 'backpack',
    description: 'Water-resistant backpack with laptop compartment and USB charging port.',
    price: 79.99,
    image: 'https://picsum.photos/seed/backpack/400/300',
    category: 'accessories',
  },
  {
    id: '5',
    name: 'Smart Watch',
    slug: 'smart-watch',
    description: 'Fitness tracker with heart rate monitor, GPS, and 7-day battery life.',
    price: 199.99,
    image: 'https://picsum.photos/seed/watch/400/300',
    category: 'electronics',
  },
  {
    id: '6',
    name: 'Coffee Maker',
    slug: 'coffee-maker',
    description: 'Programmable drip coffee maker with thermal carafe and built-in grinder.',
    price: 89.99,
    image: 'https://picsum.photos/seed/coffee/400/300',
    category: 'home',
  },
]

export function createProductFake(): ProductRepository {
  return {
    async getAll() {
      return fakeProducts
    },
    async getById(id: string) {
      const product = fakeProducts.find((p) => p.id === id)
      if (!product) throw new Error(`Product ${id} not found`)
      return product
    },
  }
}
