/**
 * DI-плагин — provide всех адаптеров.
 * Единственное место, где infrastructure подключается к приложению.
 * Чтобы переключиться на фейки — замени createXxxAdapter() на createXxxFake().
 */

import { createProductAdapter } from '~~/layers/catalog/infrastructure/product.adapter'
import { createCartAdapter } from '~~/layers/cart/infrastructure/cart.adapter'
import { createOrderAdapter } from '~~/layers/orders/infrastructure/order.adapter'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      productRepo: createProductAdapter(),
      cartRepo: createCartAdapter(),
      orderRepo: createOrderAdapter(),
    },
  }
})
