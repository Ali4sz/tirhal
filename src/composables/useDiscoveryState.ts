/**
 * `useDiscoveryState` — the single source of truth for the discovery journey.
 *
 * It owns which governorate/attraction is selected and which governorate is
 * hovered, and derives the active panel mode. Components read state via props
 * and emit intents upward; they never mutate this state directly. The map and
 * panels stay decoupled and only speak through these typed actions.
 *
 * Invariants enforced here:
 *  - At most one selected governorate and zero-or-one selected attraction.
 *  - Selecting a governorate clears any incompatible attraction selection.
 *  - Selecting an attraction establishes its containing governorate.
 *  - Unknown/deleted IDs are ignored so the UI falls back to overview safely.
 */

import { computed, ref } from 'vue'
import type { Attraction, Governorate, GovernorateId } from '@/types/tourism'
import {
  getAttractionById,
  getAttractionsByGovernorate,
  getGovernorateById,
} from '@/repositories/tourismRepository'

export type PanelMode = 'overview' | 'governorate' | 'coming-soon' | 'attraction'

// Module-level singleton state shared by every consumer.
const selectedGovernorateId = ref<GovernorateId | null>(null)
const selectedAttractionId = ref<string | null>(null)
const hoverGovernorateId = ref<GovernorateId | null>(null)
// Bumped to ask the map to (re)center on the active attraction.
const locateNonce = ref(0)

const selectedGovernorate = computed<Governorate | undefined>(() =>
  selectedGovernorateId.value ? getGovernorateById(selectedGovernorateId.value) : undefined,
)

const selectedAttraction = computed<Attraction | undefined>(() =>
  selectedAttractionId.value ? getAttractionById(selectedAttractionId.value) : undefined,
)

const visibleAttractions = computed<readonly Attraction[]>(() =>
  selectedGovernorateId.value ? getAttractionsByGovernorate(selectedGovernorateId.value) : [],
)

const panelMode = computed<PanelMode>(() => {
  if (selectedAttraction.value) return 'attraction'
  if (selectedGovernorate.value) {
    return selectedGovernorate.value.coverage === 'supported' ? 'governorate' : 'coming-soon'
  }
  return 'overview'
})

function selectGovernorate(id: GovernorateId): void {
  const governorate = getGovernorateById(id)
  if (!governorate) return
  selectedGovernorateId.value = id
  // A governorate change invalidates any previously selected attraction.
  selectedAttractionId.value = null
  hoverGovernorateId.value = null
}

function selectAttraction(id: string): void {
  const attraction = getAttractionById(id)
  if (!attraction) return
  // Selecting an attraction pulls its containing governorate into selection.
  selectedGovernorateId.value = attraction.governorateId
  selectedAttractionId.value = id
  hoverGovernorateId.value = null
  // Ask the map to center on the newly selected attraction.
  locateNonce.value++
}

/** Request the map to (re)center on the currently selected attraction. */
function requestLocate(): void {
  if (selectedAttractionId.value) locateNonce.value++
}

function clearAttractionSelection(): void {
  selectedAttractionId.value = null
}

function backToOverview(): void {
  selectedGovernorateId.value = null
  selectedAttractionId.value = null
  hoverGovernorateId.value = null
}

function setHoverGovernorate(id: GovernorateId | null): void {
  hoverGovernorateId.value = id
}

export function useDiscoveryState() {
  return {
    selectedGovernorateId,
    selectedAttractionId,
    hoverGovernorateId,
    locateNonce,
    selectedGovernorate,
    selectedAttraction,
    visibleAttractions,
    panelMode,
    selectGovernorate,
    selectAttraction,
    clearAttractionSelection,
    requestLocate,
    backToOverview,
    setHoverGovernorate,
  }
}
