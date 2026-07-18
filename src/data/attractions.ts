/**
 * JSON-backed attraction catalog for Tirhal's four launch governorates.
 *
 * Seed records remain intentionally marked as pending editorial review. This
 * adapter validates the untyped JSON at the domain boundary so invalid content
 * cannot silently break the map, list, or detail views.
 */

import records from '@/data/attractions.json'
import type { Attraction, AttractionCategory, ImageMeta, LocalizedText, SourceRef } from '@/types/tourism'

const CATEGORIES = new Set<AttractionCategory>([
  'historical',
  'religious',
  'museum',
  'nature',
  'landmark',
  'market',
  'archaeology',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLocalizedText(value: unknown): value is LocalizedText {
  return isRecord(value) && typeof value.en === 'string' && typeof value.ar === 'string'
}

function isSourceRef(value: unknown): value is SourceRef {
  return (
    isRecord(value) &&
    isLocalizedText(value.label) &&
    (value.url === undefined || typeof value.url === 'string') &&
    (value.note === undefined || typeof value.note === 'string')
  )
}

function isImageMeta(value: unknown): value is ImageMeta {
  return isRecord(value) && typeof value.src === 'string' && isLocalizedText(value.alt)
}

function isAttraction(value: unknown): value is Attraction {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.governorateId === 'string' &&
    isLocalizedText(value.name) &&
    isLocalizedText(value.description) &&
    typeof value.category === 'string' &&
    CATEGORIES.has(value.category as AttractionCategory) &&
    isRecord(value.coordinate) &&
    typeof value.coordinate.lon === 'number' &&
    Number.isFinite(value.coordinate.lon) &&
    typeof value.coordinate.lat === 'number' &&
    Number.isFinite(value.coordinate.lat) &&
    (value.image === undefined || isImageMeta(value.image)) &&
    isSourceRef(value.source) &&
    typeof value.reviewedOn === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.reviewedOn)
  )
}

function parseAttractions(value: unknown): readonly Attraction[] {
  if (!Array.isArray(value) || !value.every(isAttraction)) {
    throw new Error('Invalid attraction catalog: every record must match the Attraction contract.')
  }

  const ids = new Set<string>()
  for (const attraction of value) {
    if (ids.has(attraction.id)) {
      throw new Error(`Invalid attraction catalog: duplicate id "${attraction.id}".`)
    }
    ids.add(attraction.id)
  }

  return value
}

export const attractions = parseAttractions(records)
