/**
 * Governorate metadata for Tirhal.
 *
 * The authoritative boundary geometry lives in `src/assets/geo/syria-admin1.json`
 * (copied from the approved reference dataset). This module derives the typed
 * domain metadata (id, bilingual name, center, area, coverage) from that asset.
 * The map component consumes the raw geometry directly for rendering; this
 * module owns the editorial/domain view of each governorate.
 *
 * The geometry payload is ~1.3 MB, so it is NOT inlined into the JS bundle.
 * Instead it is emitted as a separate static asset (`?url`) and fetched at
 * runtime by `loadGovernorates()`, keeping the entry chunk small and the asset
 * independently cacheable.
 */

import type { Coverage, Governorate, LocalizedText } from '@/types/tourism'
import syriaGeoUrl from '@/assets/geo/syria-admin1.json?url'

interface GeoFeatureProps {
  adm1_name: string
  adm1_name1: string
  adm1_pcode: string
  center_lat: number
  center_lon: number
  area_sqkm: number
}

export interface SyriaAdmin1GeoJSON {
  features: Array<{ properties: GeoFeatureProps }>
}

/**
 * Governorates launched with curated attraction content. Every other governorate
 * is selectable but renders a Coming Soon state (see `Coverage`).
 */
export const SUPPORTED_PCODES: ReadonlySet<string> = new Set(['SY01', 'SY05', 'SY04', 'SY06'])

function toCoverage(pcode: string): Coverage {
  return SUPPORTED_PCODES.has(pcode) ? 'supported' : 'coming-soon'
}

let geoCache: SyriaAdmin1GeoJSON | null = null
let govCache: Governorate[] | null = null

/** Fetches the boundary asset once and memoizes the parsed GeoJSON. */
async function loadGeo(): Promise<SyriaAdmin1GeoJSON> {
  if (geoCache) return geoCache
  const res = await fetch(syriaGeoUrl)
  if (!res.ok) {
    throw new Error(`Failed to load governorate boundaries (${res.status} ${res.statusText})`)
  }
  geoCache = (await res.json()) as SyriaAdmin1GeoJSON
  return geoCache
}

/**
 * Raw Admin-1 GeoJSON (cached after first load). The map consumes the geometry
 * from this so the ~1.3 MB payload is fetched once as a static asset rather
 * than inlined into any JS chunk.
 */
export async function loadSyriaGeo(): Promise<SyriaAdmin1GeoJSON> {
  return loadGeo()
}

/**
 * Loads and maps the Syria Admin-1 boundaries into typed governorates.
 * Fetched once and memoized; safe to call repeatedly.
 */
export async function loadGovernorates(): Promise<Governorate[]> {
  if (govCache) return govCache
  const geo = await loadGeo()
  govCache = geo.features.map((feature) => {
    const p = feature.properties
    const name: LocalizedText = { en: p.adm1_name, ar: p.adm1_name1 }
    return {
      id: p.adm1_pcode,
      pcode: p.adm1_pcode,
      name,
      center: { lon: p.center_lon, lat: p.center_lat },
      areaSqKm: p.area_sqkm,
      coverage: toCoverage(p.adm1_pcode),
    }
  })
  return govCache
}
