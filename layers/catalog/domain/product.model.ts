/**
 * Модель домена Catalog — Entity Product.
 * Описывает что такое товар и бизнес-правила, связанные с ним.
 * Не знает ни про Vue, ни про API — чистый TypeScript.
 */

export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  image: string
  category: string
}

/** Проверяет, доступен ли товар для покупки */
export function isAvailable(product: Product): boolean {
  return product.price > 0
}
