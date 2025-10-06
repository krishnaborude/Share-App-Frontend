import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  esbuild: {
    // ensure JSX is transformed correctly during tests
    jsx: 'automatic'
  }
})
