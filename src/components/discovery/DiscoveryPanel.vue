<script setup lang="ts">
/**
 * DiscoveryPanel — routes between the four panel states derived from discovery
 * state: overview, supported-governorate list, coming-soon, and attraction
 * detail. It owns no state of its own.
 */
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import DiscoveryOverview from '@/components/discovery/DiscoveryOverview.vue'
import GovernoratePanel from '@/components/discovery/GovernoratePanel.vue'
import ComingSoonPanel from '@/components/discovery/ComingSoonPanel.vue'
import AttractionDetailPanel from '@/components/discovery/AttractionDetailPanel.vue'

const { panelMode } = useDiscoveryState()
</script>

<template>
  <div class="tirhal-panel">
    <DiscoveryOverview v-if="panelMode === 'overview'" />
    <GovernoratePanel v-else-if="panelMode === 'governorate'" />
    <ComingSoonPanel v-else-if="panelMode === 'coming-soon'" />
    <AttractionDetailPanel v-else-if="panelMode === 'attraction'" />
  </div>
</template>
