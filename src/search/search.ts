/**
 * Fuzzy attraction search — pure, synchronous, locale-independent.
 *
 * Contract: a query matches an attraction only when *every* normalized query
 * token matches some indexed field token. Per-token strength is strictly
 * ordered (exact > prefix > substring > bounded typo distance), name matches
 * outweigh keyword matches, and ranking is fully deterministic — score
 * descending, then attraction id ascending.
 *
 * Isolation note: this module is the seam the plan left for a library swap.
 * If hand-rolled ranking ever disappoints, Fuse.js can replace the internals
 * behind this same signature without touching any component.
 */

import type { Attraction } from '@/types/tourism'
import type { SearchIndexEntry } from './index'
import { getSearchEntries } from './index'
import { tokenizeSearchText } from './normalize'

/** A ranked search hit. */
export interface SearchMatch {
  readonly attraction: Attraction
  readonly score: number
}

/** How many results a dropdown wants by default. */
const DEFAULT_LIMIT = 7

// Per-token match strengths. Strict ordering drives ranking.
const SCORE_EXACT = 100
const SCORE_PREFIX = 70
const SCORE_SUBSTRING = 40
const SCORE_FUZZY = 20

// Keyword (category) hits always rank below equivalent name hits.
const KEYWORD_WEIGHT = 0.6

/**
 * Allowed typo distance by query-token length. Short tokens get no slack —
 * one edit away from "of" or "sea" is pure noise.
 */
function fuzzyBudget(length: number): number {
  if (length < 4) return 0
  if (length <= 6) return 1
  return 2
}

/**
 * Optimal-string-alignment edit distance with early abandon: returns false as
 * soon as the minimum cost in the current DP row exceeds `max`, which is all
 * the caller needs. Rows are fully written before being read; `?? Infinity`
 * only satisfies `noUncheckedIndexedAccess` for indices that are provably
 * in range at runtime and would fail safe (no match) if ever violated.
 */
function withinEditDistance(source: string, target: string, max: number): boolean {
  if (source === target) return true
  if (Math.abs(source.length - target.length) > max) return false

  let previous: readonly number[] = Array.from({ length: target.length + 1 }, (_, index) => index)
  let twoBefore: readonly number[] | undefined

  for (let i = 1; i <= source.length; i++) {
    const current: number[] = [i]
    let rowMinimum = i
    for (let j = 1; j <= target.length; j++) {
      const diagonal = previous[j - 1] ?? Number.POSITIVE_INFINITY
      const above = previous[j] ?? Number.POSITIVE_INFINITY
      const left = current[j - 1] ?? Number.POSITIVE_INFINITY
      let best = Math.min(
        diagonal + (source[i - 1] === target[j - 1] ? 0 : 1),
        above + 1,
        left + 1,
      )
      if (i > 1 && j > 1 && source[i - 1] === target[j - 2] && source[i - 2] === target[j - 1]) {
        const transposed = (twoBefore?.[j - 2] ?? Number.POSITIVE_INFINITY) + 1
        best = Math.min(best, transposed)
      }
      current[j] = best
      if (best < rowMinimum) rowMinimum = best
    }
    if (rowMinimum > max) return false
    twoBefore = previous
    previous = current
  }
  return (previous[target.length] ?? Number.POSITIVE_INFINITY) <= max
}

/** Best strength at which `queryToken` matches a single `fieldToken`. */
function tokenMatchScore(queryToken: string, fieldToken: string): number {
  if (queryToken === fieldToken) return SCORE_EXACT
  if (fieldToken.startsWith(queryToken)) return SCORE_PREFIX
  if (fieldToken.includes(queryToken)) return SCORE_SUBSTRING
  const budget = fuzzyBudget(queryToken.length)
  if (budget > 0 && withinEditDistance(queryToken, fieldToken, budget)) return SCORE_FUZZY
  return 0
}

/** Total score when every query token matches, or 0 when any token misses. */
function entryScore(queryTokens: readonly string[], entry: SearchIndexEntry): number {
  let total = 0
  for (const queryToken of queryTokens) {
    let bestName = 0
    for (const fieldToken of entry.nameTokens) {
      const score = tokenMatchScore(queryToken, fieldToken)
      if (score > bestName) bestName = score
    }
    let bestKeyword = 0
    for (const fieldToken of entry.keywordTokens) {
      const score = tokenMatchScore(queryToken, fieldToken) * KEYWORD_WEIGHT
      if (score > bestKeyword) bestKeyword = score
    }
    const best = Math.max(bestName, bestKeyword)
    if (best === 0) return 0
    total += best
  }
  return total
}

/**
 * Fuzzy-search the attraction catalog. An empty (or normalizes-to-empty)
 * query returns no results; ranking is deterministic for identical queries.
 */
export function searchAttractions(query: string, limit: number = DEFAULT_LIMIT): SearchMatch[] {
  const queryTokens = tokenizeSearchText(query)
  if (queryTokens.length === 0) return []

  const matches: SearchMatch[] = []
  for (const entry of getSearchEntries()) {
    const score = entryScore(queryTokens, entry)
    if (score > 0) matches.push({ attraction: entry.attraction, score })
  }

  matches.sort((first, second) => {
    if (first.score !== second.score) return second.score - first.score
    if (first.attraction.id < second.attraction.id) return -1
    if (first.attraction.id > second.attraction.id) return 1
    return 0
  })

  return matches.slice(0, Math.max(0, limit))
}
