/**
 * Event bus — communication between bounded contexts.
 * Domains communicate through events, not directly.
 * Example: orders emits 'OrderPlaced', cart listens and clears the cart.
 */

type EventHandler<T = unknown> = (payload: T) => void

const handlers = new Map<string, Set<EventHandler>>()

export function useEvents() {
  function on<T = unknown>(event: string, handler: EventHandler<T>) {
    if (!handlers.has(event)) {
      handlers.set(event, new Set())
    }
    handlers.get(event)!.add(handler as EventHandler)

    // Return the unsubscribe function
    return () => {
      handlers.get(event)?.delete(handler as EventHandler)
    }
  }

  function emit<T = unknown>(event: string, payload?: T) {
    handlers.get(event)?.forEach((handler) => handler(payload))
  }

  return { on, emit }
}
