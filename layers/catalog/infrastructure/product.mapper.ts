/**
 * ACL (Anti-Corruption Layer) — mapper between API and domain model.
 *
 * Why: the API returns data in its own format (snake_case, nested objects,
 * extra fields). The domain works with its own model. The mapper converts between them.
 *
 * Without a mapper: API changes break the domain and all components.
 * With a mapper: API changes only break this file.
 */

import type { Product } from '../domain/product.model'

/** Data format coming from the API (may differ from the domain model) */
export interface ProductApiDTO {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image_url: string       // API returns snake_case
  category_name: string   // API returns a different field name
}

/** API DTO → Domain Model */
export function toDomain(dto: ProductApiDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    price: dto.price,
    image: dto.image_url,          // mapping: image_url → image
    category: dto.category_name,   // mapping: category_name → category
  }
}

/** Domain Model → API DTO (when sending data to the server) */
export function toDTO(product: Product): ProductApiDTO {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    image_url: product.image,
    category_name: product.category,
  }
}
