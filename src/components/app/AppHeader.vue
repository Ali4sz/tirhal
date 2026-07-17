<script setup lang="ts">
/**
 * AppHeader — the persistent application header: brand identity and the
 * locale switcher. It owns no discovery or map state.
 */
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/app/LocaleSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <header class="tirhal-app__header">
    <div class="tirhal-brand">
      <span class="tirhal-brand__name">{{ t('app.name') }}</span>
      <span class="tirhal-brand__tagline">{{ t('app.tagline') }}</span>
    </div>
    <LocaleSwitcher />
  </header>
</template>
