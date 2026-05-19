/**
 * Saga integration test: OrderPlaced → cart clears.
 * Tests the event contract between Orders and Cart bounded contexts
 * using the pure event bus factory — no Vue/Nuxt required.
 */

import { describe, it, expect, vi } from 'vitest'
import { createEventBus } from '../../../shared/app/composables/useEvents'
import { OrderEvents } from '../../domain/order.events'
import { CartEvents } from '../../../cart'

describe('OrderPlaced saga', () => {
  it('emitting OrderPlaced triggers CartCleared via the event bus', () => {
    const bus = createEventBus()
    const onCartCleared = vi.fn()

    // Simulate cart subscribing to OrderPlaced (as useCart does)
    const offOrder = bus.on(OrderEvents.OrderPlaced, () => {
      bus.emit(CartEvents.CartCleared)
    })
    const offCart = bus.on(CartEvents.CartCleared, onCartCleared)

    bus.emit(OrderEvents.OrderPlaced, { id: '1', items: [], status: 'pending', total: 0, createdAt: '' })

    expect(onCartCleared).toHaveBeenCalledTimes(1)

    offOrder()
    offCart()
  })

  it('OrderPlaced is not triggered by other events', () => {
    const bus = createEventBus()
    const handler = vi.fn()
    const off = bus.on(OrderEvents.OrderPlaced, handler)

    bus.emit(OrderEvents.OrderCancelled, { id: '1' })

    expect(handler).not.toHaveBeenCalled()
    off()
  })

  it('saga does not fire after unsubscribing', () => {
    const bus = createEventBus()
    const onCartCleared = vi.fn()

    const offSaga = bus.on(OrderEvents.OrderPlaced, () => {
      bus.emit(CartEvents.CartCleared)
    })
    const offCart = bus.on(CartEvents.CartCleared, onCartCleared)

    offSaga() // simulates component unmount / onUnmounted

    bus.emit(OrderEvents.OrderPlaced, { id: '2', items: [], status: 'pending', total: 0, createdAt: '' })

    expect(onCartCleared).not.toHaveBeenCalled()
    offCart()
  })
})
