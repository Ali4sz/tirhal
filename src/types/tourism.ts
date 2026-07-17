/**
 * Domain types for Tirhal's tourism content.
 *
 * These types describe the *editorial* data contract: governorates and
 * attractions with bilingual fields, geography, categories, media, and
 * provenance. They are intentionally separate from Vue I18n UI chrome messages
 * (see `src/i18n`) so content review and a future API/CMS migration stay clean.
 */

import type { AppLocale } from './locale'

/** A bilingual string field. Both locales are always required and present. */
export interface LocalizedText {
  en: string
  ar: string
}

/** Stable governorate identifier — the authoritative admin1 pcode (e.g. "SY01"). */
export type GovernorateId = string

/** Launch coverage state for a governorate. */
export type Coverage = 'supported' | 'coming-soon'

export interface Coordinate {
  /** Longitude in decimal degrees (WGS84 / EPSG:4326). */
  lon: number
  /** Latitude in decimal degrees (WGS84 / EPSG:4326). */
  lat: number
}

export interface Governorate {
  id: GovernorateId
  pcode: string
  name: LocalizedText
  /** Approximate centroid, used for "locate" and initial framing. */
  center: Coordinate
  areaSqKm: number
  coverage: Coverage
}

export type AttractionCategory =
  | 'historical'
  | 'religious'
  | 'museum'
  | 'nature'
  | 'landmark'
  | 'market'
  | 'archaeology'

export interface ImageMeta {
  src: string
  alt: LocalizedText
}

export interface SourceRef {
  label: LocalizedText
  url?: string
  /** Editorial/provenance note, e.g. licensing or verification status. */
  note?: string
}

export interface Attraction {
  id: string
  governorateId: GovernorateId
  name: LocalizedText
  description: LocalizedText
  category: AttractionCategory
  coordinate: Coordinate
  /** Optional; omitted entirely when no approved media exists. */
  image?: ImageMeta
  source: SourceRef
  /** ISO date (YYYY-MM-DD) of the last editorial review. */
  reviewedOn: string
}

/** Helper to read a localized field for the active locale. */
export function localized(value: LocalizedText, locale: AppLocale): string {
  return value[locale]
}
