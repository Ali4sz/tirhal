/**
 * `useLocale` — the single owner of Tirhal's root language/direction state.
 *
 * Per the RTL implementation baseline, exactly one module is allowed to mutate
 * `document.documentElement.lang` and `.dir`. That is this composable. Child
 * components must emit a locale-change intent and call `setLocale`; they must
 * never touch the document direction themselves.
 *
 * Locale resolution precedence (deterministic):
 *   1. Explicit saved user preference (localStorage)
 *   2. A supported browser language preference
 *   3. English fallback
 *
 * The resolved locale is applied to the document *before* the Vue app mounts
 * (via `applyInitialLocale`, called from `src/main.ts`) to avoid an LTR→RTL
 * flash. An explicit user choice is the only thing persisted.
 */

import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import i18n from '@/i18n'
import {
  DEFAULT_LOCALE,
  LOCALE_META,
  SUPPORTED_LOCALES,
  getDirection,
  isAppLocale,
  type AppLocale,
} from '@/types/locale'

const STORAGE_KEY = 'tirhal:locale'

function readStoredLocale(): AppLocale | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw !== null && isAppLocale(raw) ? raw : null
  } catch {
    return null
  }
}

function detectBrowserLocale(): AppLocale | null {
  if (typeof navigator === 'undefined') return null
  const candidates: readonly string[] =
    navigator.languages ?? (typeof navigator.language === 'string' ? [navigator.language] : [])
  for (const candidate of candidates) {
    const base = candidate.toLowerCase().split('-')[0]
    if (isAppLocale(base)) return base
  }
  return null
}

/** Resolve the initial locale using the documented precedence. Pure; no side effects. */
export function resolveInitialLocale(): AppLocale {
  return readStoredLocale() ?? detectBrowserLocale() ?? DEFAULT_LOCALE
}

// Module-level single source of truth for the active locale.
const currentLocale = ref<AppLocale>(resolveInitialLocale())

function applyDocumentDirection(locale: AppLocale): void {
  const el = document.documentElement
  el.lang = locale
  el.dir = getDirection(locale)
}

/**
 * Apply the resolved initial locale to the document and the i18n runtime.
 * Must be called from `src/main.ts` *before* `app.mount()` so the first paint
 * already has the correct `lang`/`dir`.
 */
export function applyInitialLocale(): void {
  i18n.global.locale.value = currentLocale.value
  applyDocumentDirection(currentLocale.value)
}

export function useLocale() {
  const { locale: i18nLocale } = useI18n()

  const locale = computed<AppLocale>(() => currentLocale.value)
  const isRtl = computed(() => getDirection(currentLocale.value) === 'rtl')
  const intlLocale = computed(() => LOCALE_META[currentLocale.value].intlLocale)
  const supportedLocales = SUPPORTED_LOCALES

  /** Switch locale, update document direction, sync i18n, and persist an explicit choice. */
  function setLocale(next: AppLocale): void {
    if (!isAppLocale(next) || next === currentLocale.value) return
    currentLocale.value = next
    i18nLocale.value = next
    applyDocumentDirection(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Persistence is best-effort; an unavailable store must not break the UI.
    }
  }

  return { locale, isRtl, intlLocale, supportedLocales, setLocale }
}
