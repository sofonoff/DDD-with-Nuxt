/**
 * Tests for the Product ACL mapper.
 * Verifies that API DTO ↔ Domain Model conversion works correctly.
 */

import { describe, it, expect } from 'vitest'
import { toDomain, toDTO } from '../product.mapper'
import type { ProductApiDTO } from '../product.mapper'
import type { Product } from '../../domain/product.model'

const dto: ProductApiDTO = {
  id: '1',
  name: 'Headphones',
  slug: 'headphones',
  description: 'Wireless headphones',
  price: 299.99,
  image_url: 'https://example.com/img.jpg',
  category_name: 'electronics',
}

const product: Product = {
  id: '1',
  name: 'Headphones',
  slug: 'headphones',
  description: 'Wireless headphones',
  price: 299.99,
  image: 'https://example.com/img.jpg',
  category: 'electronics',
}

describe('product.mapper', () => {
  it('toDomain maps API DTO to domain model', () => {
    expect(toDomain(dto)).toEqual(product)
  })

  it('toDTO maps domain model back to API DTO', () => {
    expect(toDTO(product)).toEqual(dto)
  })

  it('toDomain handles field renaming correctly', () => {
    const mapped = toDomain(dto)
    expect(mapped.image).toBe(dto.image_url)
    expect(mapped.category).toBe(dto.category_name)
    expect((mapped as Record<string, unknown>).image_url).toBeUndefined()
    expect((mapped as Record<string, unknown>).category_name).toBeUndefined()
  })
})
