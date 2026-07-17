/**
 * Locale domain types and metadata for Tirhal.
 *
 * This module is the single source of truth for which locales Tirhal supports
 * and for each locale's document direction and Intl formatting tag. It does NOT
 * own UI chrome strings (those live in `src/i18n/messages/*` via Vue I18n) nor
 * editorial tourism content (that lives in the typed static repository).
 */

export const SUPPORTED_LOCALES = ['en', 'ar'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

/** Fallback locale used when no supported preference can be resolved. */
export const DEFAULT_LOCALE: AppLocale = 'en'

export type Direction = 'ltr' | 'rtl'

export interface LocaleMeta {
  code: AppLocale
  /** Document writing direction for this locale. */
  dir: Direction
  /** BCP-47 tag used for `Intl` date/number formatting of editorial data. */
  intlLocale: string
}

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
  en: { code: 'en', dir: 'ltr', intlLocale: 'en-US' },
  ar: { code: 'ar', dir: 'rtl', intlLocale: 'ar-SY' },
}

/** Type guard that validates an unknown value against supported locales. */
export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/** Returns the document direction for a locale (never throws). */
export function getDirection(locale: AppLocale): Direction {
  return LOCALE_META[locale].dir
}
