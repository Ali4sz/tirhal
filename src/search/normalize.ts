/**
 * Search text normalization — the foundation of bilingual fuzzy matching.
 *
 * Both the search index and every user query pass through
 * `normalizeSearchText` before matching, so equivalent spellings collapse to
 * the same comparable string. Raw edit-distance matching against Arabic fails
 * the primary use case — users type unvocalized, hamza-free text ("الاموي")
 * while the dataset stores vocalized forms ("الأمويّ") — so normalization is a
 * pre-pass, never an afterthought.
 *
 * Folding rules (standard search-engine conventions for Arabic):
 *  - NFD decomposition + combining-mark stripping folds Latin diacritics
 *    (é→e) and, because أ إ آ ؤ ئ decompose to base letter + combining hamza,
 *    it also unifies all alef/hamza-carrier variants for free.
 *  - Tashkeel (U+064B–U+065F) and superscript alef (U+0670) are stripped.
 *  - Tatweel (U+0640) is stripped: "الــكبير" === "الكبير".
 *  - Explicit folds for letters with no canonical decomposition:
 *    ٱ (alef wasla) → ا, ى (alef maksura) → ي, ة (teh marbuta) → ه.
 *  - Latin case folding, non letter/digit/space removal, whitespace collapse.
 */

/** Combining marks: Latin block, Arabic tashkeel + hamza carriers, dagger alif. */
const COMBINING_MARKS = /[\u0300-\u036f\u064b-\u065f\u0670]/g
/** Arabic tatweel elongation, invisible to search. */
const TATWEEL = /\u0640/g
/** Letter folds for variants without canonical decompositions. */
const ALEF_WASLA = /\u0671/g
const ALEF_MAKSURA = /\u0649/g
const TEH_MARBUTA = /\u0629/g
/** Keep letters, digits, and whitespace; everything else becomes a separator. */
const NON_SEARCH_CHARS = /[^\p{L}\p{N}\s]/gu
const WHITESPACE_RUNS = /\s+/g

/**
 * Fold `input` into a canonical, locale-agnostic comparable form.
 *
 * `normalizeSearchText('الأمويّ') === normalizeSearchText('الاموي')` and
 * `normalizeSearchText('Café') === 'cafe'` — the invariants the search
 * index, the scorer, and the unit tests all rely on.
 */
export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(TATWEEL, '')
    .replace(ALEF_WASLA, '\u0627')
    .replace(ALEF_MAKSURA, '\u064a')
    .replace(TEH_MARBUTA, '\u0647')
    .toLowerCase()
    .replace(NON_SEARCH_CHARS, ' ')
    .replace(WHITESPACE_RUNS, ' ')
    .trim()
}

/** Split `input` into normalized search tokens (empty input yields none). */
export function tokenizeSearchText(input: string): string[] {
  const normalized = normalizeSearchText(input)
  if (normalized === '') return []
  return normalized.split(' ')
}
