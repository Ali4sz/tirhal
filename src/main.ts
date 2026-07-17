import { createApp } from 'vue'

import App from './App.vue'
import i18n from './i18n'
import { applyInitialLocale } from '@/composables/useLocale'
import { initTourismData } from '@/repositories/tourismRepository'

// Global stylesheets — imported exactly once here.
// `main.css` holds all Tirhal design tokens, reset, layout, and OpenLayers overrides.
// `ol/ol.css` is OpenLayers' required base stylesheet.
import './assets/main.css'
import 'ol/ol.css'

async function bootstrap() {
  // Resolve and apply the initial locale (lang + dir) to <html> BEFORE the app
  // mounts, so the first paint already reflects the correct direction.
  applyInitialLocale()

  const app = createApp(App)

  app.use(i18n)

  // Load governorate boundaries before the first paint so the map and panel
  // have data immediately. If it fails, still mount — the UI degrades
  // gracefully to an empty state rather than a blank screen.
  try {
    await initTourismData()
  } catch (err) {
    console.error('[tirhal] failed to load tourism data', err)
  }

  app.mount('#app')
}

bootstrap()
