import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vitest/config'

// Standalone Vitest config: unit tests are pure Node-environment logic, so the
// Vue/devtools plugins of vite.config.ts are deliberately not loaded here. The
// `@` alias mirrors vite.config.ts so `src/**` imports resolve identically.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.spec.ts'],
  },
})
