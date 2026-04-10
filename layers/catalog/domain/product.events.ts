/**
 * Catalog domain events.
 * Event names that this context can emit.
 * Other contexts subscribe to them via useEvents().
 */

export const ProductEvents = {
  /** User viewed a product card */
  ProductViewed: 'catalog:ProductViewed',
} as const
