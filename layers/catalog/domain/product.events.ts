/**
 * Domain Events домена Catalog.
 * Имена событий, которые этот контекст может эмитить.
 * Другие контексты подписываются на них через useEvents().
 */

export const ProductEvents = {
  /** Пользователь просмотрел карточку товара */
  ProductViewed: 'catalog:ProductViewed',
} as const
