import { describe, expect, it } from 'vitest'

import type { SearchMatch } from '../search'
import { searchAttractions } from '../search'

function resultIds(matches: readonly SearchMatch[]): string[] {
  return matches.map((match) => match.attraction.id)
}

describe('searchAttractions — success-criteria queries', () => {
  it('finds the Umayyad Mosque from the misspelling "umayad"', () => {
    const results = searchAttractions('umayad')
    expect(resultIds(results)).toEqual(['dam-umayyad-mosque'])
  })

  it('finds الجامع الأموي from unvocalized, hamza-free "الاموي"', () => {
    const results = searchAttractions('الاموي')
    expect(resultIds(results)).toEqual(['dam-umayyad-mosque'])
  })

  it('surfaces castle-category attractions for "castle", ranking a name hit first', () => {
    const results = searchAttractions('castle')
    expect(resultIds(results)).toEqual([
      'ham-masyaf-castle',
      'dam-citadel',
      'ham-citadel',
      'hom-citadel',
      'hom-krak-des-chevaliers',
      'lat-tetraporticus',
    ])
  })

  it('surfaces Krak des Chevaliers for the Arabic keyword "قلعة"', () => {
    const results = searchAttractions('قلعة')
    expect(resultIds(results)).toContain('hom-krak-des-chevaliers')
    expect(resultIds(results)).toContain('dam-citadel')
  })
})

describe('searchAttractions — matching behavior', () => {
  it('matches a multi-token query only when every token matches', () => {
    expect(resultIds(searchAttractions('Umayyad Mosque'))).toEqual(['dam-umayyad-mosque'])

    // "castle" narrows to historical sites, "damascus" to one of them.
    expect(resultIds(searchAttractions('castle damascus'))).toEqual(['dam-citadel'])

    // A token matching nowhere excludes the whole attraction.
    expect(resultIds(searchAttractions('castle tokyo'))).toEqual([])
  })

  it('matches by token prefix', () => {
    const results = searchAttractions('cita')
    expect(resultIds(results)).toContain('dam-citadel')
    expect(resultIds(results)).toContain('ham-citadel')
    expect(resultIds(results)).toContain('hom-citadel')
  })

  it('matches Arabic queries against English data and vice versa', () => {
    expect(resultIds(searchAttractions('دمشق'))).toContain('dam-citadel')
    expect(resultIds(searchAttractions('damascus'))).toContain('dam-citadel')
  })

  it('returns nothing for empty or non-searchable queries', () => {
    expect(searchAttractions('')).toEqual([])
    expect(searchAttractions('   ')).toEqual([])
    expect(searchAttractions('!?—')).toEqual([])
    expect(searchAttractions('zzzzz')).toEqual([])
  })
})

describe('searchAttractions — ranking contract', () => {
  it('is deterministic across calls', () => {
    const first = resultIds(searchAttractions('citadel'))
    const second = resultIds(searchAttractions('citadel'))
    expect(first).toEqual(second)
  })

  it('breaks score ties by attraction id', () => {
    // Three name hits score 100; all six historicals match the keyword at 60.
    // Ties resolve by id, so the order is fully deterministic.
    const results = searchAttractions('citadel')
    expect(resultIds(results)).toEqual([
      'dam-citadel',
      'ham-citadel',
      'hom-citadel',
      'ham-masyaf-castle',
      'hom-krak-des-chevaliers',
      'lat-tetraporticus',
    ])
  })

  it('honours the result limit', () => {
    expect(searchAttractions('castle', 2)).toHaveLength(2)
    expect(resultIds(searchAttractions('castle', 2))[0]).toBe('ham-masyaf-castle')
    expect(searchAttractions('castle', 0)).toEqual([])
  })
})
