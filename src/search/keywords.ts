/**
 * Curated bilingual keyword synonyms per attraction category.
 *
 * Searchable content is bilingual names + category keywords. Category labels
 * themselves come from the i18n message bundles (see `index.ts`); this map
 * adds *synonyms* the labels miss — the case where a query term is common but
 * absent from both the category label and some attraction names. The canonical
 * example: "castle" never appears in "Krak des Chevaliers", yet a castle query
 * must surface it.
 *
 * This is a search concern, not editorial content, so it deliberately lives
 * outside the attractions dataset — the data contract stays clean for a future
 * CMS/API migration. Keep the lists short; entries are normalized at
 * index-build time, so raw spellings are fine here.
 */

import type { AttractionCategory } from '@/types/tourism'

export const categoryKeywords: Record<AttractionCategory, readonly string[]> = {
  historical: ['castle', 'citadel', 'fortress', 'palace', 'قلعة', 'حصن', 'قصر'],
  religious: ['mosque', 'church', 'monastery', 'shrine', 'جامع', 'مسجد', 'كنيسة', 'دير'],
  museum: [],
  nature: ['valley', 'mountain', 'beach', 'spring', 'waterfall', 'وادي', 'جبل', 'شاطئ', 'نبع'],
  landmark: ['noria', 'waterwheel', 'arch', 'monument', 'ناعورة', 'قوس'],
  market: ['souq', 'souk', 'bazaar', 'بازار'],
  archaeology: ['ruins', 'ancient', 'tell', 'أثري', 'آثار', 'تل'],
}
