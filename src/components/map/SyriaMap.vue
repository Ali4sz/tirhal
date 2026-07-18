<script setup lang="ts">
/**
 * SyriaMap — owns the OpenLayers instance and all map runtime behavior.
 *
 * Responsibilities:
 *  - Render the approved Syria governorate boundaries (from the GeoJSON asset).
 *  - Render attraction markers ONLY for the selected, supported governorate.
 *  - Select governorates / attractions and report hover via the discovery store.
 *  - Fit the view to a selected governorate, and center on a selected attraction.
 *  - Keep the canvas geographically unmirrored; only UI chrome reacts to `dir`.
 *
 * The component reads/writes discovery state through `useDiscoveryState` (the
 * single source of truth) and never mutates it ad hoc. Sizing is driven by a
 * single ResizeObserver scheduled via requestAnimationFrame to avoid layout
 * thrashing.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { fromLonLat } from 'ol/proj'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Style, Fill, Stroke, Circle as CircleStyle, Text } from 'ol/style'
import type { Extent } from 'ol/extent'
import type { MapBrowserEvent } from 'ol'
import type { FeatureLike } from 'ol/Feature'
import type { Attraction, Governorate, GovernorateId } from '@/types/tourism'
import { loadSyriaGeo } from '@/data/governorates'
import { getGovernorates } from '@/repositories/tourismRepository'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import { useLocale } from '@/composables/useLocale'
import MapControls from '@/components/map/MapControls.vue'
import MapStatusOverlay from '@/components/map/MapStatusOverlay.vue'

const { t } = useI18n()
const { locale } = useLocale()
const {
  selectedGovernorateId,
  hoverGovernorateId,
  visibleAttractions,
  selectedAttractionId,
  locateNonce,
  selectGovernorate,
  selectAttraction,
  setHoverGovernorate,
} = useDiscoveryState()

const governorates = getGovernorates()

const mapEl = ref<HTMLDivElement | null>(null)

// OpenLayers instances (created in onMounted, torn down in onBeforeUnmount).
let map: OlMap | null = null
let governorateLayer: VectorLayer | null = null
let governorateSource: VectorSource | null = null
let markerLayer: VectorLayer | null = null
let markerSource: VectorSource | null = null
let resizeObserver: ResizeObserver | null = null
let resizeRaf = 0
let motionMql: MediaQueryList | null = null
const reducedMotion = ref(false)

// Domain metadata keyed by pcode, for labels and coverage-aware styling.
const govByPcode = new Map<string, Governorate>(governorates.map((g) => [g.pcode, g]))

const ariaLabel = computed(() => t('a11y.mapRegion'))

const selectedName = computed(() =>
  selectedGovernorateId.value
    ? (govByPcode.get(selectedGovernorateId.value)?.name[locale.value] ?? null)
    : null,
)
const hoverName = computed(() =>
  hoverGovernorateId.value
    ? (govByPcode.get(hoverGovernorateId.value)?.name[locale.value] ?? null)
    : null,
)

// ---------------------------------------------------------------------------
// Styles (read reactive state via closure; re-render via layer.changed())
// ---------------------------------------------------------------------------
function governorateStyle(feature: FeatureLike): Style {
  const pcode = feature.get('adm1_pcode') as string | undefined
  const gov = pcode ? govByPcode.get(pcode) : undefined
  const isSelected = selectedGovernorateId.value === pcode
  const isHovered = hoverGovernorateId.value === pcode
  const supported = gov?.coverage === 'supported'

  const fillColor = isSelected
    ? 'rgba(59, 110, 165, 0.38)'
    : isHovered
      ? 'rgba(59, 110, 165, 0.22)'
      : supported
        ? 'rgba(224, 226, 236, 0.55)'
        : 'rgba(224, 226, 236, 0.35)'

  return new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({
      color: isSelected ? '#3b6ea5' : '#74777f',
      width: isSelected ? 2.5 : 1,
    }),
    text: new Text({
      text: gov ? gov.name[locale.value] : (pcode ?? ''),
      font: '600 13px system-ui, sans-serif',
      fill: new Fill({ color: '#1a1c1e' }),
      stroke: new Stroke({ color: 'rgba(255, 255, 255, 0.85)', width: 3 }),
      overflow: true,
    }),
  })
}

function markerStyle(): Style {
  return new Style({
    image: new CircleStyle({
      radius: 7,
      fill: new Fill({ color: '#3b6ea5' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 }),
    }),
  })
}

// ---------------------------------------------------------------------------
// View fitting / centering
// ---------------------------------------------------------------------------
function fitToExtent(extent: Extent | null, animate: boolean): void {
  if (!map || !extent) return
  const view = map.getView()
  view.fit(extent, {
    padding: [48, 48, 48, 48],
    duration: animate && !reducedMotion.value ? 600 : 0,
    maxZoom: 11,
  })
}

function fitToGovernorate(pcode: GovernorateId): void {
  const feature = governorateSource?.getFeatureById(pcode)
  const geom = feature?.getGeometry()
  if (geom) fitToExtent(geom.getExtent(), true)
}

function centerOnAttraction(): void {
  if (!map || !selectedAttractionId.value) return
  const attraction = visibleAttractions.value.find((a) => a.id === selectedAttractionId.value)
  if (!attraction) return
  map.getView().animate({
    center: fromLonLat([attraction.coordinate.lon, attraction.coordinate.lat]),
    zoom: 12,
    duration: reducedMotion.value ? 0 : 500,
  })
}

// ---------------------------------------------------------------------------
// Interactions
// ---------------------------------------------------------------------------
let clickRequest = 0

async function handleClick(evt: MapBrowserEvent): Promise<void> {
  // VectorLayer#getFeatures() uses OpenLayers' efficient hit detection. It
  // avoids Canvas2D pixel readback while remaining sufficient for our large
  // governorate polygons and deliberately sized attraction markers.
  const request = ++clickRequest
  const markerFeatures = markerLayer ? await markerLayer.getFeatures(evt.pixel) : []
  if (request !== clickRequest) return
  const markerId = markerFeatures[0]?.getId()
  if (typeof markerId === 'string') {
    selectAttraction(markerId)
    return
  }

  const governorateFeatures = governorateLayer ? await governorateLayer.getFeatures(evt.pixel) : []
  if (request !== clickRequest) return
  const pcode = governorateFeatures[0]?.get('adm1_pcode') as string | undefined
  if (pcode) selectGovernorate(pcode)
}

let lastHoverPcode: string | null = null
let hoverRequest = 0

async function handlePointerMove(evt: MapBrowserEvent): Promise<void> {
  const request = ++hoverRequest
  const features = governorateLayer ? await governorateLayer.getFeatures(evt.pixel) : []
  if (request !== hoverRequest) return

  const found = (features[0]?.get('adm1_pcode') as string | undefined) ?? null
  if (found !== lastHoverPcode) {
    lastHoverPcode = found
    if (mapEl.value) mapEl.value.style.cursor = found ? 'pointer' : ''
    setHoverGovernorate(found)
  }
}

function handleMotionPreferenceChange(event: MediaQueryListEvent): void {
  reducedMotion.value = event.matches
}

// ---------------------------------------------------------------------------
// Control intents
// ---------------------------------------------------------------------------
function zoomBy(delta: number): void {
  if (!map) return
  const view = map.getView()
  const current = view.getZoom() ?? 1
  view.animate({ zoom: current + delta, duration: reducedMotion.value ? 0 : 200 })
}
function zoomIn(): void {
  zoomBy(1)
}
function zoomOut(): void {
  zoomBy(-1)
}
function resetView(): void {
  if (governorateSource) fitToExtent(governorateSource.getExtent(), true)
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------
onMounted(() => {
  governorateSource = new VectorSource()
  governorateLayer = new VectorLayer({ source: governorateSource, style: governorateStyle })

  markerSource = new VectorSource()
  markerLayer = new VectorLayer({ source: markerSource, style: markerStyle })

  // Basemap: CARTO Positron (no labels). Boundary-free so our governorate
  // borders are the sole authoritative lines on screen.
  // Attribution required by CARTO (terms: carto.com/legal) and ODbL.
  const osmLayer = new TileLayer({
    source: new XYZ({
      urls: [
        'https://a.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
      ],
      attributions:
        '© <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a> · ' +
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>',
      maxZoom: 20,
    }),
  })

  map = new OlMap({
    target: mapEl.value ?? undefined,
    layers: [osmLayer, governorateLayer, markerLayer],
    view: new View({ center: fromLonLat([38, 35]), zoom: 6 }),
  })

  map.on('singleclick', handleClick)
  map.on('pointermove', handlePointerMove)

  // Honor the user's motion preference for map animations.
  motionMql = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionMql.matches
  motionMql.addEventListener('change', handleMotionPreferenceChange)

  // Size the map reliably when the panel/layout changes.
  if (mapEl.value) {
    resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => map?.updateSize())
    })
    resizeObserver.observe(mapEl.value)
  }

  // Boundaries are fetched once as a static asset (cached by initTourismData)
  // and rendered here, then the view frames all of Syria.
  loadSyriaGeo()
    .then((geo) => {
      const geoFormat = new GeoJSON({
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
      })
      const features = geoFormat.readFeatures(geo) as Feature[]
      for (const f of features) {
        const pcode = f.get('adm1_pcode')
        if (typeof pcode === 'string') f.setId(pcode)
      }
      governorateSource?.addFeatures(features)
      if (governorateSource) fitToExtent(governorateSource.getExtent(), false)
    })
    .catch((err) => {
      console.error('[tirhal] failed to render governorate boundaries', err)
    })
})

onBeforeUnmount(() => {
  clickRequest += 1
  hoverRequest += 1
  cancelAnimationFrame(resizeRaf)
  resizeObserver?.disconnect()
  resizeObserver = null
  motionMql?.removeEventListener('change', handleMotionPreferenceChange)
  if (map) {
    map.setTarget(undefined)
    map = null
  }
  governorateLayer = null
  governorateSource = null
  markerLayer = null
  markerSource = null
})

// ---------------------------------------------------------------------------
// Reactive wiring
// ---------------------------------------------------------------------------
watch(
  () => [selectedGovernorateId.value, hoverGovernorateId.value, locale.value],
  () => governorateLayer?.changed(),
)

watch(
  visibleAttractions,
  (list) => {
    if (!markerSource) return
    markerSource.clear()
    for (const attraction of list) {
      const feature = new Feature({
        geometry: new Point(fromLonLat([attraction.coordinate.lon, attraction.coordinate.lat])),
      })
      feature.setId(attraction.id)
      markerSource.addFeature(feature)
    }
  },
  { immediate: true },
)

watch(selectedGovernorateId, (id) => {
  if (id) fitToGovernorate(id)
  else if (governorateSource) fitToExtent(governorateSource.getExtent(), true)
})

// Center on the selected attraction whenever a locate is requested.
watch(locateNonce, () => centerOnAttraction())
</script>

<template>
  <div class="tirhal-map-wrap">
    <div ref="mapEl" class="tirhal-map" tabindex="0" :aria-label="ariaLabel"></div>

    <MapControls
      :zoom-in-label="t('map.zoomIn')"
      :zoom-out-label="t('map.zoomOut')"
      :reset-label="t('map.resetView')"
      @zoom-in="zoomIn"
      @zoom-out="zoomOut"
      @reset="resetView"
    />

    <MapStatusOverlay
      :hover-name="hoverName"
      :selected-name="selectedName"
      :hover-label="t('map.hover')"
      :selected-label="t('map.selected')"
    />
  </div>
</template>
