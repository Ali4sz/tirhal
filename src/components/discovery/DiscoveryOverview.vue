<script setup lang="ts">
/**
 * DiscoveryOverview — the welcome panel shown before any selection.
 *
 * This is the first thing a visitor reads, so it states what Tirhal is and walks
 * through the three steps of the discovery journey before handing off to the map.
 */
import { useI18n } from 'vue-i18n'
import AtlasPlaceholder from '@/components/ui/AtlasPlaceholder.vue'
import GovernorateNavigator from '@/components/discovery/GovernorateNavigator.vue'

const { t } = useI18n()
</script>

<template>
  <section class="tirhal-panel-section tirhal-overview">
    <div class="tirhal-panel-eyebrow">
      <span>{{ t('panel.overview.eyebrow') }}</span>
      <span class="tirhal-panel-eyebrow__line" aria-hidden="true" />
      <span>{{ t('panel.overview.coverage') }}</span>
    </div>
    <h2 class="tirhal-panel-title tirhal-overview__title" data-panel-heading tabindex="-1">
      {{ t('panel.overview.title') }}
    </h2>
    <p class="tirhal-panel-intro">{{ t('panel.overview.intro') }}</p>

    <AtlasPlaceholder compact :label="t('a11y.decorativePlaceholder')" />

    <div class="tirhal-overview__prompt">
      <span class="tirhal-overview__compass" aria-hidden="true">✦</span>
      <p>{{ t('panel.overview.prompt') }}</p>
    </div>

    <h3 class="tirhal-panel-subtitle tirhal-overview__steps-title">
      {{ t('panel.overview.howItWorks') }}
    </h3>
    <ol class="tirhal-steps">
      <li class="tirhal-steps__item">{{ t('panel.overview.step1') }}</li>
      <li class="tirhal-steps__item">{{ t('panel.overview.step2') }}</li>
      <li class="tirhal-steps__item">{{ t('panel.overview.step3') }}</li>
    </ol>

    <p class="tirhal-panel-hint">{{ t('panel.overview.hint') }}</p>
    <GovernorateNavigator />
  </section>
</template>
