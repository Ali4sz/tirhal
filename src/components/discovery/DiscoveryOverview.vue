<script setup lang="ts">
/**
 * DiscoveryOverview — the initial panel shown before any selection.
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <section class="tirhal-panel-section">
    <h2 class="tirhal-panel-title">{{ t('panel.overview.title') }}</h2>
    <p class="tirhal-panel-intro">{{ t('panel.overview.intro') }}</p>
    <p class="tirhal-panel-hint">{{ t('panel.overview.hint') }}</p>
  </section>
</template>
