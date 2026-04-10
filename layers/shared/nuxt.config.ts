/**
 * Shared layer config.
 * Registers the app/components/ui directory as a component source with the Ui prefix.
 */

export default defineNuxtConfig({
  components: [
    { path: 'components/ui', prefix: 'Ui' },
  ],
})
