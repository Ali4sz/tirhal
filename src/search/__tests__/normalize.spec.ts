import { describe, expect, it } from 'vitest'

import { normalizeSearchText, tokenizeSearchText } from '../normalize'

describe('normalizeSearchText — Arabic folding', () => {
  it('folds vocalized text to its unvocalized form', () => {
    expect(normalizeSearchText('الأمويّ')).toBe('الاموي')
    expect(normalizeSearchText('الاموي')).toBe('الاموي')
    expect(normalizeSearchText('بُنيت')).toBe('بنيت')
  })

  it('unifies alef variants through NFD decomposition', () => {
    expect(normalizeSearchText('آثار')).toBe('اثار')
    expect(normalizeSearchText('أوغاريت')).toBe('اوغاريت')
    expect(normalizeSearchText('إ')).toBe('ا')
  })

  it('folds hamza carriers to their base letters', () => {
    expect(normalizeSearchText('شئ')).toBe('شي')
    expect(normalizeSearchText('رؤوف')).toBe('رووف')
  })

  it('folds teh marbuta to heh and alef maksura to ya', () => {
    expect(normalizeSearchText('قلعة')).toBe('قلعه')
    expect(normalizeSearchText('قلعه')).toBe('قلعه')
    expect(normalizeSearchText('على')).toBe('علي')
  })

  it('strips tatweel and superscript alef', () => {
    expect(normalizeSearchText('الـــكبير')).toBe('الكبير')
    expect(normalizeSearchText('هٰذا')).toBe('هذا')
  })

  it('treats unvocalized queries and vocalized data as identical', () => {
    expect(normalizeSearchText('الأمويّ')).toBe(normalizeSearchText('الاموي'))
  })
})

describe('normalizeSearchText — Latin folding', () => {
  it('lowercases and strips diacritics', () => {
    expect(normalizeSearchText('Umayyad')).toBe('umayyad')
    expect(normalizeSearchText('Café')).toBe('cafe')
    expect(normalizeSearchText('É')).toBe('e')
  })
})

describe('normalizeSearchText — separators and edge cases', () => {
  it('converts punctuation to separators and collapses whitespace', () => {
    expect(normalizeSearchText('Ugarit (Ras Shamra)')).toBe('ugarit ras shamra')
    expect(normalizeSearchText('Al-Hamidiyah')).toBe('al hamidiyah')
    expect(normalizeSearchText('  damascus   castle  ')).toBe('damascus castle')
  })

  it('returns an empty string for empty or non-search input', () => {
    expect(normalizeSearchText('')).toBe('')
    expect(normalizeSearchText('   ')).toBe('')
    expect(normalizeSearchText('!?—·')).toBe('')
  })
})

describe('tokenizeSearchText', () => {
  it('splits normalized text into tokens', () => {
    expect(tokenizeSearchText('Citadel of Damascus')).toEqual(['citadel', 'of', 'damascus'])
    expect(tokenizeSearchText('الجامع الأموي')).toEqual(['الجامع', 'الاموي'])
  })

  it('yields no tokens for empty input', () => {
    expect(tokenizeSearchText('')).toEqual([])
    expect(tokenizeSearchText('  !?  ')).toEqual([])
  })
})
