import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            const pkg = id.split('node_modules/')[1]?.split('/')[0] ?? ''
            if (pkg === 'ol' || pkg.startsWith('@intlify')) return 'vendor-ol'
            if (pkg === 'vue-i18n') return 'vendor-i18n'
            return 'vendor'
          }
        },
      },
    },
  },
})
