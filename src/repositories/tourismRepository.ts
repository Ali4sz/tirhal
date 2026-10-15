/**
 * Tourism repository facade for Tirhal.
 *
 * This is the single data-access boundary the UI depends on. Today it serves
 * typed static modules; later it can be replaced by an HTTP/CMS implementation
 * that satisfies the same function signatures — without changing any component
 * or map code. All returned collections are read-only; unknown IDs resolve to
 * `undefined` / an empty list rather than throwing.
 *
 * Governorate boundaries are fetched at runtime (see `loadGovernorates`); call
 * `initTourismData()` once before the UI reads from this module so the in-memory
 * indexes are populated.
 */

import type { Attraction, Governorate, GovernorateId } from '@/types/tourism'
import { loadGovernorates } from '@/data/governorates'
import { attractions } from '@/data/attractions'

let governorates: Governorate[] = []
let governorateById = new Map<GovernorateId, Governorate>()

const attractionById = new Map<string, Attraction>(
  attractions.map((attraction) => [attraction.id, attraction]),
)

let loaded = false

/** Loads governorate boundaries and builds the lookup indexes. Idempotent. */
export async function initTourismData(): Promise<void> {
  if (loaded) return
  governorates = await loadGovernorates()
  governorateById = new Map(governorates.map((governorate) => [governorate.id, governorate]))
  loaded = true
}

/** All governorates, in GeoJSON source order. */
export function getGovernorates(): readonly Governorate[] {
  return governorates
}

/** A single governorate by id, or `undefined` if unknown. */
export function getGovernorateById(id: GovernorateId): Governorate | undefined {
  return governorateById.get(id)
}

/** All attractions, in dataset order. */
export function getAttractions(): readonly Attraction[] {
  return attractions
}

/** Attractions belonging to a governorate (empty if none or unknown id). */
export function getAttractionsByGovernorate(id: GovernorateId): readonly Attraction[] {
  return attractions.filter((attraction) => attraction.governorateId === id)
}

/** A single attraction by id, or `undefined` if unknown. */
export function getAttractionById(id: string): Attraction | undefined {
  return attractionById.get(id)
}
