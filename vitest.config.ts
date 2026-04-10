import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['layers/**/domain/__tests__/**', 'layers/**/infrastructure/__tests__/**'],
  },
})
