<script setup lang="ts">
/**
 * AppHeader — floating chrome overlay: brand identity pill and the locale
 * switcher trigger. It owns no discovery or map state. It renders no
 * conventional header bar; it floats transparently over the map surface.
 */
import { useI18n } from 'vue-i18n'
import LocaleSwitcher from '@/components/app/LocaleSwitcher.vue'

const { t } = useI18n()
</script>

<template>
  <div class="tirhal-app__header">
    <span class="tirhal-brand-pill">{{ t('app.name') }}</span>
    <LocaleSwitcher />
  </div>
</template>
