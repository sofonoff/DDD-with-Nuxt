import { createEventBus } from '../composables/useEvents'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      eventBus: createEventBus(),
    },
  }
})
