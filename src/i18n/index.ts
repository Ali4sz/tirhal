/**
 * Vue I18n configuration for Tirhal.
 *
 * Vue I18n owns UI chrome messages only. Editorial, bilingual tourism content
 * lives in the typed static repository and is formatted with `Intl` using the
 * active locale's BCP-47 tag.
 *
 * The initial `<html lang>` / `<html dir>` are applied *before* `createApp()`
 * mounts (see `src/main.ts` and `useLocale`). This module only configures the
 * message runtime; it must not mutate the document directly.
 */

import { createI18n } from 'vue-i18n'
import en from './messages/en'
import ar from './messages/ar'
import { DEFAULT_LOCALE } from '@/types/locale'

export const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    en,
    ar,
  },
})

export default i18n
