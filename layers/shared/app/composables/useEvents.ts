/**
 * Event bus — communication between bounded contexts.
 * Domains communicate through events, not directly.
 * Example: orders emits 'OrderPlaced', cart listens and clears the cart.
 *
 * createEventBus() — pure factory, used in the Nuxt plugin and in tests.
 * useEvents() — composable that returns the app-scoped instance from the plugin.
 *   Scoping to the app instance (not the module) prevents handler accumulation
 *   across calls and state leaks between SSR requests.
 */

type EventHandler<T = unknown> = (payload: T) => void

export type EventBus = ReturnType<typeof createEventBus>

export function createEventBus() {
  const handlers = new Map<string, Set<EventHandler>>()

  function on<T = unknown>(event: string, handler: EventHandler<T>) {
    if (!handlers.has(event)) handlers.set(event, new Set())
    handlers.get(event)!.add(handler as EventHandler)
    return () => handlers.get(event)?.delete(handler as EventHandler)
  }

  function emit<T = unknown>(event: string, payload?: T) {
    handlers.get(event)?.forEach((h) => h(payload))
  }

  return { on, emit }
}

export function useEvents(): EventBus {
  return useNuxtApp().$eventBus as EventBus
}
