/**
 * DI plugin — provides all adapters.
 * The only place where infrastructure connects to the application.
 *
 * Switch between adapter/fake via env:
 *   NUXT_PUBLIC_ADAPTER_MODE=fake npm run dev
 *
 * Or in .env:
 *   NUXT_PUBLIC_ADAPTER_MODE=fake
 */

import { createProductAdapter } from '~~/layers/catalog/infrastructure/product.adapter'
import { createProductFake } from '~~/layers/catalog/infrastructure/product.fake'
import { createCartAdapter } from '~~/layers/cart/infrastructure/cart.adapter'
import { createCartFake } from '~~/layers/cart/infrastructure/cart.fake'
import { createOrderAdapter } from '~~/layers/orders/infrastructure/order.adapter'
import { createOrderFake } from '~~/layers/orders/infrastructure/order.fake'

export default defineNuxtPlugin(() => {
  const { adapterMode } = useRuntimeConfig().public
  const useFakes = adapterMode === 'fake'

  return {
    provide: {
      productRepo: useFakes ? createProductFake() : createProductAdapter(),
      cartRepo: useFakes ? createCartFake() : createCartAdapter(),
      orderRepo: useFakes ? createOrderFake() : createOrderAdapter(),
    },
  }
})
