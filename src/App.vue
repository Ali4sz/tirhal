<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/components/app/AppHeader.vue'
import DiscoveryPanel from '@/components/discovery/DiscoveryPanel.vue'

// The map pulls in OpenLayers (~1 MB). Load it as a separate chunk so the
// app shell (header + panel) paints immediately and OL streams in after.
const SyriaMap = defineAsyncComponent(() => import('@/components/map/SyriaMap.vue'))

const { t } = useI18n()
const mapRegionLabel = t('a11y.mapRegion')
const panelRegionLabel = t('a11y.panelRegion')
</script>

<template>
  <div class="tirhal-app">
    <AppHeader />

    <main class="tirhal-app__map" :aria-label="mapRegionLabel">
      <SyriaMap />
    </main>

    <aside class="tirhal-app__panel" :aria-label="panelRegionLabel">
      <div class="tirhal-app__panel-card">
        <DiscoveryPanel />
      </div>
    </aside>
  </div>
</template>
