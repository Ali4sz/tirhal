/**
 * `useSearch` — the single source of truth for the attraction-search
 * interaction, mirroring the module-level singleton pattern of
 * `useDiscoveryState`.
 *
 * It owns the query text, the ranked results derived from it, and the active
 * option index for keyboard navigation. Selecting a result is *not* new state:
 * it forwards the intent to the discovery store (`selectAttraction`), which
 * already handles governorate establishment, map centering, and the panel
 * switch — then clears the query so the input never holds stale text.
 *
 * Matching runs synchronously over the in-memory index; at the current catalog
 * scale it is sub-millisecond, so no debounce is applied. Revisit (and prefer
 * a debounced/async search) once the catalog passes roughly 500 attractions.
 */

import { computed, ref, watch } from 'vue'
import { searchAttractions } from '@/search/search'
import { useDiscoveryState } from '@/composables/useDiscoveryState'

// Module-level singleton state shared by every consumer.
const query = ref('')
const activeIndex = ref(-1)

const results = computed(() => {
  const trimmed = query.value.trim()
  if (trimmed === '') return []
  return searchAttractions(trimmed)
})

// Keep the keyboard highlight inside the result list: snap to the first result
// whenever results change (so Enter selects the top hit) or clear it when the
// query stops matching anything.
watch(results, (next) => {
  activeIndex.value = next.length > 0 ? 0 : -1
})

/** Move the highlighted option by `delta`, clamped to the result list. */
function moveActive(delta: number): void {
  if (results.value.length === 0) return
  const next = Math.min(Math.max(activeIndex.value + delta, 0), results.value.length - 1)
  activeIndex.value = next
}

/** Select the currently highlighted result, if any. */
function selectActive(): void {
  const current = results.value[activeIndex.value]
  if (current) selectResult(current.attraction.id)
}

/**
 * Select an attraction by id through the discovery store, then clear the
 * query so the next search starts from a clean input.
 */
function selectResult(id: string): void {
  useDiscoveryState().selectAttraction(id)
  clearSearch()
}

/** Clear the query (and, via the watcher, the highlight). */
function clearSearch(): void {
  query.value = ''
}

export function useSearch() {
  return {
    query,
    results,
    activeIndex,
    moveActive,
    selectActive,
    selectResult,
    clearSearch,
  }
}
