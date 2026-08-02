<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/app/AppHeader.vue'
import DiscoveryPanel from '@/components/discovery/DiscoveryPanel.vue'
import { useDiscoveryState } from '@/composables/useDiscoveryState'

// The map pulls in OpenLayers (~1 MB). Load it as a separate chunk so the
// app shell (header + panel) paints immediately and OL streams in after.
const SyriaMap = defineAsyncComponent(() => import('@/components/map/SyriaMap.vue'))

const { t } = useI18n()
const { panelMode } = useDiscoveryState()
const mapRegionLabel = computed(() => t('a11y.mapRegion'))
const panelRegionLabel = computed(() => t('a11y.panelRegion'))

// The drawer collapses at every viewport. It starts open on desktop, where
// there is room for the welcome copy, and closed on mobile so the map is
// unobstructed — only the handle shows until the user opens it.
const COMPACT_QUERY = '(max-width: 599px)'
const compactViewport = window.matchMedia(COMPACT_QUERY)
const drawerExpanded = shallowRef(!compactViewport.matches)

// Crossing the breakpoint re-applies the per-viewport default, unless the user
// has already made an explicit choice — theirs wins for the rest of the session.
const userToggled = shallowRef(false)

function handleViewportChange(event: MediaQueryListEvent): void {
  if (userToggled.value) return
  drawerExpanded.value = !event.matches
}

function toggleDrawer(): void {
  userToggled.value = true
  drawerExpanded.value = !drawerExpanded.value
}

watch(panelMode, (mode) => {
  if (compactViewport.matches && mode !== 'overview') drawerExpanded.value = true
})

onMounted(() => {
  compactViewport.addEventListener('change', handleViewportChange)
})

onBeforeUnmount(() => {
  compactViewport.removeEventListener('change', handleViewportChange)
})
</script>

<template>
  <div class="tirhal-app" :class="{ 'tirhal-app--drawer-collapsed': !drawerExpanded }">
    <a class="tirhal-skip-link" href="#tirhal-map-canvas">{{ t('a11y.skipToMap') }}</a>
    <main class="tirhal-app__map" :aria-label="mapRegionLabel">
      <SyriaMap />

      <!-- Floating chrome overlays the map; no reserved header row. -->
      <AppHeader />
    </main>

    <aside
      class="tirhal-app__panel"
      :class="{ 'tirhal-app__panel--expanded': drawerExpanded }"
      :aria-label="panelRegionLabel"
    >
      <button
        type="button"
        class="tirhal-app__panel-handle"
        :aria-expanded="drawerExpanded"
        aria-controls="tirhal-drawer-content"
        :aria-label="drawerExpanded ? t('a11y.drawerCollapse') : t('a11y.drawerExpand')"
        :title="drawerExpanded ? t('a11y.drawerCollapse') : t('a11y.drawerExpand')"
        @click="toggleDrawer"
      >
        <span class="tirhal-app__panel-handle-grip" aria-hidden="true" />
        <span class="tirhal-app__panel-handle-label">{{ t('panel.sheet.explore') }}</span>
        <svg class="tirhal-app__panel-handle-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m7 10 5 5 5-5" />
        </svg>
      </button>
      <div id="tirhal-drawer-content" class="tirhal-app__panel-card">
        <DiscoveryPanel />
      </div>
    </aside>
  </div>
</template>
