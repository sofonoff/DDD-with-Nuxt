/**
 * Шина событий — связь между bounded contexts.
 * Домены общаются через события, а не напрямую.
 * Пример: orders эмитит 'OrderPlaced', cart слушает и очищает корзину.
 */

type EventHandler<T = unknown> = (payload: T) => void

const handlers = new Map<string, Set<EventHandler>>()

export function useEvents() {
  function on<T = unknown>(event: string, handler: EventHandler<T>) {
    if (!handlers.has(event)) {
      handlers.set(event, new Set())
    }
    handlers.get(event)!.add(handler as EventHandler)

    // Возвращаем функцию отписки
    return () => {
      handlers.get(event)?.delete(handler as EventHandler)
    }
  }

  function emit<T = unknown>(event: string, payload?: T) {
    handlers.get(event)?.forEach((handler) => handler(payload))
  }

  return { on, emit }
}
