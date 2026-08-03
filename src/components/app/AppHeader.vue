<script setup lang="ts">
/**
 * AppHeader — floating chrome overlay: the brand identity pill.
 *
 * It owns no discovery or map state and renders no conventional header bar; it
 * floats transparently over the map surface. The locale switcher lives inside
 * the discovery drawer (see `DiscoveryPanel`), not here.
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <header class="tirhal-app__header">
    <div class="tirhal-brand" aria-label="Tirhal">
      <span class="tirhal-brand__seal" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <path d="M8 31c7-1 8-10 16-10s9 9 16 10" />
          <path d="M12 35h24M17 35V24m14 11V24" />
          <circle cx="24" cy="13" r="3" />
        </svg>
      </span>
      <span class="tirhal-brand__copy">
        <strong class="tirhal-brand__name">{{ t('app.name') }}</strong>
        <span class="tirhal-brand__tagline">{{ t('app.tagline') }}</span>
      </span>
    </div>
  </header>
</template>
