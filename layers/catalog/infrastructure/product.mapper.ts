/**
 * ACL (Anti-Corruption Layer) — маппер между API и доменной моделью.
 *
 * Зачем: API отдаёт данные в своём формате (snake_case, вложенные объекты,
 * лишние поля). Домен работает со своей моделью. Маппер конвертирует между ними.
 *
 * Без маппера: изменение API ломает domain и все компоненты.
 * С маппером: изменение API ломает только этот файл.
 */

import type { Product } from '../domain/product.model'

/** Формат данных, который приходит от API (может отличаться от доменной модели) */
export interface ProductApiDTO {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image_url: string       // API отдаёт snake_case
  category_name: string   // API отдаёт другое имя поля
}

/** API DTO → Domain Model */
export function toDomain(dto: ProductApiDTO): Product {
  return {
    id: dto.id,
    name: dto.name,
    slug: dto.slug,
    description: dto.description,
    price: dto.price,
    image: dto.image_url,          // маппинг: image_url → image
    category: dto.category_name,   // маппинг: category_name → category
  }
}

/** Domain Model → API DTO (если нужно отправить на сервер) */
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
