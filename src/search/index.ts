/**
 * Search index — the in-memory, pre-normalized view of the attraction catalog.
 *
 * Built once at module load from the repository facade (never from the raw
 * dataset import, preserving the future API/CMS migration boundary). Each
 * entry holds normalized tokens for the bilingual name fields and the category
 * keywords — the category labels come from *both* i18n message bundles, so a
 * query matches across languages regardless of the active UI locale.
 */

import type { Attraction } from '@/types/tourism'
import { getAttractions } from '@/repositories/tourismRepository'
import { categoryKeywords } from './keywords'
import { tokenizeSearchText } from './normalize'
import en from '@/i18n/messages/en'
import ar from '@/i18n/messages/ar'

/** Normalized tokens for one attraction's searchable fields. */
export interface SearchIndexEntry {
  readonly attraction: Attraction
  /** Tokens of `name.en` and `name.ar` — the highest-weight fields. */
  readonly nameTokens: readonly string[]
  /** Tokens of the localized category labels plus curated synonyms. */
  readonly keywordTokens: readonly string[]
}

function collectTokens(source: Iterable<string>): string[] {
  const tokens = new Set<string>()
  for (const text of source) {
    for (const token of tokenizeSearchText(text)) tokens.add(token)
  }
  return [...tokens]
}

function buildEntry(attraction: Attraction): SearchIndexEntry {
  const nameTokens = collectTokens([attraction.name.en, attraction.name.ar])
  const keywordTokens = collectTokens([
    en.categories[attraction.category],
    ar.categories[attraction.category],
    ...categoryKeywords[attraction.category],
  ])
  return { attraction, nameTokens, keywordTokens }
}

const entries: readonly SearchIndexEntry[] = getAttractions().map(buildEntry)

/** All index entries, in dataset order. */
export function getSearchEntries(): readonly SearchIndexEntry[] {
  return entries
}
