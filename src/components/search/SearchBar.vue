<script setup lang="ts">
/**
 * SearchBar — floating fuzzy search over the attraction catalog.
 *
 * A combobox pill in the map's top chrome: typing shows a live listbox of
 * ranked results; keyboard and pointer both navigate; selecting a result
 * hands off to the discovery store (`selectAttraction`, which centers the
 * map, opens the attraction panel, and expands the compact drawer) and
 * clears the query. Matching itself lives in the search module — this
 * component owns presentation and focus only.
 *
 * Accessibility: focus stays in the input while navigating options
 * (the `aria-activedescendant` pattern), the result count and empty state
 * are announced politely, and the dropdown closes when focus leaves the
 * combobox without passing between its own parts.
 */
import { computed, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from '@/composables/useLocale'
import { useSearch } from '@/composables/useSearch'
import type { Attraction } from '@/types/tourism'
import { localized } from '@/types/tourism'
import { getGovernorateById } from '@/repositories/tourismRepository'

const { t } = useI18n()
const { locale } = useLocale()
const { query, results, activeIndex, moveActive, selectActive, selectResult, clearSearch } =
  useSearch()

// Dropdown visibility is transient UI state: open while the user interacts
// with a non-empty query, closed on Escape, clear, selection, or focus-out.
const resultsOpen = ref(false)
const rootRef = useTemplateRef<HTMLElement>('root')
const inputRef = useTemplateRef<HTMLInputElement>('searchInput')

const hasQuery = computed(() => query.value.trim() !== '')
const showResults = computed(() => resultsOpen.value && hasQuery.value)

const activeDescendantId = computed(() =>
  activeIndex.value >= 0 ? `tirhal-search-option-${activeIndex.value}` : undefined,
)

/** Polite announcement: the result count, or the empty-state message. */
const statusText = computed(() => {
  if (!showResults.value) return ''
  return results.value.length > 0
    ? t('search.resultsLabel', { count: results.value.length })
    : t('search.noResults')
})

/** Secondary result line: localized category · localized governorate name. */
function resultMeta(attraction: Attraction): string {
  const category = t(`categories.${attraction.category}`)
  const governorate = getGovernorateById(attraction.governorateId)
  if (!governorate) return category
  return `${category} · ${localized(governorate.name, locale.value)}`
}

function handleInput(): void {
  resultsOpen.value = true
}

function handleFocus(): void {
  // Refocusing with a query in progress reopens its dropdown.
  if (hasQuery.value) resultsOpen.value = true
}

function handleEnter(): void {
  selectActive()
  resultsOpen.value = false
}

function handleEscape(): void {
  clearSearch()
  resultsOpen.value = false
}

function handleClear(): void {
  clearSearch()
  resultsOpen.value = false
  inputRef.value?.focus()
}

function handleSelect(id: string): void {
  selectResult(id)
  resultsOpen.value = false
}

/** Close when focus leaves the combobox, but not when it moves within it. */
function handleFocusout(event: FocusEvent): void {
  const next = event.relatedTarget
  if (next instanceof Node && rootRef.value?.contains(next)) return
  resultsOpen.value = false
}
</script>

<template>
  <div
    ref="root"
    class="tirhal-search"
    role="search"
    :aria-label="t('search.label')"
    @focusout="handleFocusout"
  >
    <div class="tirhal-search__field">
      <svg class="tirhal-search__icon" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
      </svg>
      <input
        ref="searchInput"
        v-model="query"
        class="tirhal-search__input"
        type="text"
        role="combobox"
        data-testid="search-input"
        :aria-label="t('search.label')"
        :aria-expanded="showResults"
        aria-controls="tirhal-search-listbox"
        aria-autocomplete="list"
        :aria-activedescendant="activeDescendantId"
        autocomplete="off"
        spellcheck="false"
        :placeholder="t('search.placeholder')"
        @input="handleInput"
        @focus="handleFocus"
        @keydown.down.prevent="moveActive(1)"
        @keydown.up.prevent="moveActive(-1)"
        @keydown.enter.prevent="handleEnter"
        @keydown.esc="handleEscape"
      />
      <button
        v-if="hasQuery"
        type="button"
        class="tirhal-search__clear"
        :aria-label="t('search.clear')"
        @click="handleClear"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12m0-12-12 12" /></svg>
      </button>

      <div v-if="showResults" class="tirhal-search__popover">
        <ul
          v-if="results.length > 0"
          id="tirhal-search-listbox"
          role="listbox"
          :aria-label="t('search.label')"
          class="tirhal-search__results"
        >
          <li
            v-for="(result, index) in results"
            :id="`tirhal-search-option-${index}`"
            :key="result.attraction.id"
            role="option"
            class="tirhal-search__option"
            :class="{ 'tirhal-search__option--active': index === activeIndex }"
            :aria-selected="index === activeIndex"
            :data-attraction-id="result.attraction.id"
            @mousedown.prevent
            @mousemove="activeIndex = index"
            @click="handleSelect(result.attraction.id)"
          >
            <span class="tirhal-search__option-name">
              {{ localized(result.attraction.name, locale) }}
            </span>
            <span class="tirhal-search__option-meta">
              {{ resultMeta(result.attraction) }}
            </span>
          </li>
        </ul>
        <p v-else class="tirhal-search__empty">{{ t('search.noResults') }}</p>
      </div>
    </div>

    <span class="tirhal-sr-only" role="status" aria-live="polite">{{ statusText }}</span>
  </div>
</template>
