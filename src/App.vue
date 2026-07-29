<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/app/AppHeader.vue'
import DiscoveryPanel from '@/components/discovery/DiscoveryPanel.vue'

// The map pulls in OpenLayers (~1 MB). Load it as a separate chunk so the
// app shell (header + panel) paints immediately and OL streams in after.
const SyriaMap = defineAsyncComponent(() => import('@/components/map/SyriaMap.vue'))

const { t } = useI18n()
const mapRegionLabel = t('a11y.mapRegion')
const panelRegionLabel = t('a11y.panelRegion')

// Mobile bottom drawer state: starts compact (only handle visible).
// On desktop this state is harmless — CSS keeps the side-card layout.
const drawerExpanded = ref(false)

function toggleDrawer(): void {
  drawerExpanded.value = !drawerExpanded.value
}
</script>

<template>
  <div class="tirhal-app">
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
        :aria-label="drawerExpanded ? t('a11y.drawerCollapse') : t('a11y.drawerExpand')"
        @click="toggleDrawer"
      >
        <span class="tirhal-app__panel-handle-arrow" aria-hidden="true" />
      </button>
      <div class="tirhal-app__panel-card">
        <DiscoveryPanel />
      </div>
    </aside>
  </div>
</template>
