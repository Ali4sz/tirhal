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
import { computed, onBeforeUnmount, onMounted, shallowRef, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import OlMap from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
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

const mapEl = useTemplateRef<HTMLDivElement>('mapEl')

// OpenLayers instances (created in onMounted, torn down in onBeforeUnmount).
let map: OlMap | null = null
let governorateLayer: VectorLayer | null = null
let governorateSource: VectorSource | null = null
let markerLayer: VectorLayer | null = null
let markerSource: VectorSource | null = null
let resizeObserver: ResizeObserver | null = null
let resizeRaf = 0
let motionMql: MediaQueryList | null = null
const reducedMotion = shallowRef(false)
const hoverAttractionId = shallowRef<string | null>(null)

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
// Warm MD3-inspired palette mirroring the tokens defined in `main.css`.
// OpenLayers canvas styles cannot safely consume CSS variables, so these
// named constants are the source of truth for map overlays and markers.
// Basemap tiles are intentionally NOT recolored — only overlays/markers.
const MAP_COLORS = {
  primary: '#c75b39', // --md-sys-color-primary
  primaryAlpha: (a: number) => `rgba(199, 91, 57, ${a})`, // primary w/ alpha
  primaryContainer: '#fad9c7', // --md-sys-color-primary-container
  secondary: '#8b5a2b', // --md-sys-color-secondary
  secondaryContainer: '#edd5bb', // --md-sys-color-secondary-container
  surfaceContainer: '#f5e8d5', // --md-sys-color-surface-container
  surfaceContainerHigh: '#efdac0', // --md-sys-color-surface-container-high
  onSurface: '#2a1810', // --md-sys-color-on-surface
  onSurfaceVariant: '#6b5440', // --md-sys-color-on-surface-variant
  outline: '#d4b896', // --md-sys-color-outline
  white: '#ffffff',
} as const

function governorateStyle(feature: FeatureLike): Style {
  const pcode = feature.get('adm1_pcode') as string | undefined
  const gov = pcode ? govByPcode.get(pcode) : undefined
  const isSelected = selectedGovernorateId.value === pcode
  const isHovered = hoverGovernorateId.value === pcode
  const supported = gov?.coverage === 'supported'

  const fillColor = isSelected
    ? MAP_COLORS.primaryAlpha(0.42)
    : isHovered
      ? MAP_COLORS.primaryAlpha(0.28)
      : supported
        ? `${MAP_COLORS.surfaceContainer}f5` // ~96% alpha
        : `${MAP_COLORS.surfaceContainer}e6` // ~90% alpha

  return new Style({
    fill: new Fill({ color: fillColor }),
    stroke: new Stroke({
      color: isSelected ? MAP_COLORS.primary : MAP_COLORS.outline,
      width: isSelected ? 2.5 : 1,
    }),
    text: new Text({
      text: gov ? gov.name[locale.value] : (pcode ?? ''),
      font: '600 13px system-ui, sans-serif',
      fill: new Fill({ color: MAP_COLORS.onSurface }),
      stroke: new Stroke({ color: 'rgba(255, 255, 255, 0.85)', width: 3 }),
      overflow: true,
    }),
  })
}

function markerStyle(feature: FeatureLike): Style[] {
  const id = feature.getId()
  const selected = id === selectedAttractionId.value
  const hovered = id === hoverAttractionId.value
  const category = feature.get('category') as Attraction['category'] | undefined
  const categoryGlyph: Record<Attraction['category'], string> = {
    archaeology: 'A',
    historical: 'H',
    landmark: 'L',
    market: 'M',
    museum: 'M',
    nature: 'N',
    religious: 'R',
  }

  const styles: Style[] = []
  if (selected || hovered) {
    styles.push(
      new Style({
        image: new CircleStyle({
          radius: selected ? 18 : 15,
          fill: new Fill({ color: MAP_COLORS.primaryAlpha(selected ? 0.18 : 0.12) }),
          stroke: new Stroke({ color: MAP_COLORS.primaryAlpha(0.35), width: 1 }),
        }),
      }),
    )
  }

  styles.push(
    new Style({
      image: new CircleStyle({
        radius: selected ? 11 : hovered ? 10 : 8,
        fill: new Fill({ color: selected ? MAP_COLORS.secondary : MAP_COLORS.primary }),
        stroke: new Stroke({ color: MAP_COLORS.white, width: 3 }),
      }),
      text: new Text({
        text: category ? categoryGlyph[category] : '•',
        font: `700 ${selected ? 9 : 8}px system-ui, sans-serif`,
        fill: new Fill({ color: MAP_COLORS.white }),
      }),
      zIndex: selected ? 12 : hovered ? 11 : 10,
    }),
  )
  return styles
}

// ---------------------------------------------------------------------------
// View fitting / centering
// ---------------------------------------------------------------------------
function getViewPadding(): [number, number, number, number] {
  const base = 56
  const panel = document.querySelector<HTMLElement>('.tirhal-app__panel')
  if (!panel || !panel.matches('.tirhal-app__panel--expanded')) return [base, base, base, base]
  const panelRect = panel.getBoundingClientRect()
  if (window.innerWidth < 600)
    return [base, base, Math.min(panelRect.height + 24, window.innerHeight * 0.72), base]
  const onLeft = panelRect.left < window.innerWidth / 2
  return onLeft
    ? [base, base, base, Math.min(panelRect.width + 32, window.innerWidth * 0.48)]
    : [base, Math.min(panelRect.width + 32, window.innerWidth * 0.48), base, base]
}

function fitToExtent(extent: Extent | null, animate: boolean): void {
  if (!map || !extent) return
  const view = map.getView()
  view.fit(extent, {
    padding: getViewPadding(),
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
  if (evt.dragging) return
  const request = ++hoverRequest
  const markerFeatures = markerLayer ? await markerLayer.getFeatures(evt.pixel) : []
  if (request !== hoverRequest) return
  const markerId = markerFeatures[0]?.getId()
  const nextAttractionId = typeof markerId === 'string' ? markerId : null
  if (nextAttractionId !== hoverAttractionId.value) {
    hoverAttractionId.value = nextAttractionId
    markerLayer?.changed()
  }
  const features = governorateLayer ? await governorateLayer.getFeatures(evt.pixel) : []
  if (request !== hoverRequest) return

  const found = (features[0]?.get('adm1_pcode') as string | undefined) ?? null
  if (found !== lastHoverPcode) {
    lastHoverPcode = found
    if (mapEl.value) mapEl.value.style.cursor = found || nextAttractionId ? 'pointer' : ''
    setHoverGovernorate(found)
  }
}

function clearPointerState(): void {
  hoverRequest += 1
  lastHoverPcode = null
  hoverAttractionId.value = null
  setHoverGovernorate(null)
  markerLayer?.changed()
  if (mapEl.value) mapEl.value.style.cursor = ''
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

  // Basemap: OpenStreetMap standard tiles. Sits beneath the governorate
  // polygons and attraction markers. Attribution is rendered by Tirhal's
  // own edition chrome (the native ol-attribution control is disabled).
  const osmLayer = new TileLayer({
    source: new OSM({
      attributions: '© OpenStreetMap contributors',
    }),
  })

  map = new OlMap({
    target: mapEl.value ?? undefined,
    controls: [],
    layers: [osmLayer, governorateLayer, markerLayer],
    view: new View({ center: fromLonLat([38, 35]), zoom: 6 }),
  })

  map.on('singleclick', handleClick)
  map.on('pointermove', handlePointerMove)
  map.getViewport().addEventListener('pointerleave', clearPointerState)

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
    map.getViewport().removeEventListener('pointerleave', clearPointerState)
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

watch(selectedAttractionId, () => markerLayer?.changed())

watch(
  visibleAttractions,
  (list) => {
    if (!markerSource) return
    markerSource.clear()
    for (const attraction of list) {
      const feature = new Feature({
        geometry: new Point(fromLonLat([attraction.coordinate.lon, attraction.coordinate.lat])),
        category: attraction.category,
      })
      feature.setId(attraction.id)
      markerSource.addFeature(feature)
    }
  },
  { immediate: true },
)

watch(selectedGovernorateId, (id) => {
  if (id && !selectedAttractionId.value) fitToGovernorate(id)
  else if (governorateSource) fitToExtent(governorateSource.getExtent(), true)
})

// Center on the selected attraction whenever a locate is requested.
watch(locateNonce, () => centerOnAttraction())
</script>

<template>
  <div class="tirhal-map-wrap" data-testid="map-root">
    <div
      id="tirhal-map-canvas"
      ref="mapEl"
      class="tirhal-map"
      tabindex="0"
      :aria-label="ariaLabel"
    ></div>

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

    <div class="tirhal-map-edition" aria-hidden="true">35°N · 38°E</div>
    <div class="tirhal-map-attribution" aria-label="Map data attribution">
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener"
        >© OpenStreetMap contributors</a
      >
    </div>
  </div>
</template>
