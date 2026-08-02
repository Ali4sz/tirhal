<script setup lang="ts">
/**
 * DiscoveryPanel — routes between the four panel states derived from discovery
 * state: overview, supported-governorate list, coming-soon, and attraction
 * detail. It owns no state of its own.
 *
 * It also hosts the locale switcher in a persistent footer row, so language can
 * be changed from any panel mode without leaving the drawer.
 */
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import DiscoveryOverview from '@/components/discovery/DiscoveryOverview.vue'
import GovernoratePanel from '@/components/discovery/GovernoratePanel.vue'
import ComingSoonPanel from '@/components/discovery/ComingSoonPanel.vue'
import AttractionDetailPanel from '@/components/discovery/AttractionDetailPanel.vue'
import LocaleSwitcher from '@/components/app/LocaleSwitcher.vue'

const { t } = useI18n()
const { panelMode } = useDiscoveryState()
const panelBodyRef = useTemplateRef<HTMLElement>('panelBody')
const panelModeLabel = computed(() => t(`panel.mode.${panelMode.value}`))

watch(panelMode, async () => {
  await nextTick()
  panelBodyRef.value
    ?.querySelector<HTMLElement>('[data-panel-heading]')
    ?.focus({ preventScroll: true })
})
</script>

<template>
  <div class="tirhal-panel">
    <div ref="panelBody" class="tirhal-panel__body" :data-panel-mode="panelMode">
      <span class="tirhal-sr-only" role="status" aria-live="polite">{{ panelModeLabel }}</span>
      <Transition name="tirhal-story" mode="out-in">
        <DiscoveryOverview v-if="panelMode === 'overview'" key="overview" />
        <GovernoratePanel v-else-if="panelMode === 'governorate'" key="governorate" />
        <ComingSoonPanel v-else-if="panelMode === 'coming-soon'" key="coming-soon" />
        <AttractionDetailPanel v-else key="attraction" />
      </Transition>
    </div>

    <footer class="tirhal-panel__footer">
      <span class="tirhal-panel__footer-label">{{ t('localeSwitcher.label') }}</span>
      <LocaleSwitcher />
    </footer>
  </div>
</template>
