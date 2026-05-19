import { describe, it, expect, vi } from 'vitest'
import { createEventBus } from '../composables/useEvents'

describe('createEventBus', () => {
  it('calls handler when event is emitted', () => {
    const bus = createEventBus()
    const handler = vi.fn()
    bus.on('test:event', handler)
    bus.emit('test:event', { value: 42 })
    expect(handler).toHaveBeenCalledWith({ value: 42 })
  })

  it('calls handler with no payload when emit has no second arg', () => {
    const bus = createEventBus()
    const handler = vi.fn()
    bus.on('test:empty', handler)
    bus.emit('test:empty')
    expect(handler).toHaveBeenCalledWith(undefined)
  })

  it('calls multiple handlers for the same event', () => {
    const bus = createEventBus()
    const a = vi.fn()
    const b = vi.fn()
    bus.on('multi', a)
    bus.on('multi', b)
    bus.emit('multi', 'payload')
    expect(a).toHaveBeenCalledWith('payload')
    expect(b).toHaveBeenCalledWith('payload')
  })

  it('does not call handlers for a different event', () => {
    const bus = createEventBus()
    const handler = vi.fn()
    bus.on('eventA', handler)
    bus.emit('eventB', 'x')
    expect(handler).not.toHaveBeenCalled()
  })

  it('unsubscribe stops receiving events', () => {
    const bus = createEventBus()
    const handler = vi.fn()
    const off = bus.on('unsub:test', handler)
    off()
    bus.emit('unsub:test', 'ignored')
    expect(handler).not.toHaveBeenCalled()
  })

  it('unsubscribing one handler does not affect others', () => {
    const bus = createEventBus()
    const a = vi.fn()
    const b = vi.fn()
    const offA = bus.on('shared', a)
    bus.on('shared', b)
    offA()
    bus.emit('shared', 'data')
    expect(a).not.toHaveBeenCalled()
    expect(b).toHaveBeenCalledWith('data')
  })

  it('emitting to an event with no subscribers does not throw', () => {
    const bus = createEventBus()
    expect(() => bus.emit('no:subscribers', 'x')).not.toThrow()
  })

  it('each createEventBus() instance is fully isolated', () => {
    const busA = createEventBus()
    const busB = createEventBus()
    const handler = vi.fn()
    busA.on('shared:event', handler)
    busB.emit('shared:event', 'from B')
    expect(handler).not.toHaveBeenCalled()
  })
})
