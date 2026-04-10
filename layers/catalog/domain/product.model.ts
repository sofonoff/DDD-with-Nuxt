/**
 * Catalog domain model — Entity Product.
 * Describes what a product is and its associated business rules.
 * Knows nothing about Vue or API — pure TypeScript.
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

/** Checks whether the product is available for purchase */
export function isAvailable(product: Product): boolean {
  return product.price > 0
}
