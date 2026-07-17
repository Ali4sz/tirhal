<script setup lang="ts">
/**
 * LocaleSwitcher — accessible English/Arabic language switch.
 *
 * It is the sanctioned UI control for changing locale: it calls `useLocale`
 * (the single owner of `<html lang>`/`<html dir>`). It never touches the
 * document direction directly.
 */
import { useI18n } from 'vue-i18n'
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/types/locale'

const { t } = useI18n()
const { locale, supportedLocales, setLocale } = useLocale()

function labelFor(code: AppLocale): string {
  return t(`localeSwitcher.${code}`)
}
</script>

<template>
  <div class="tirhal-locale" role="group" :aria-label="t('localeSwitcher.label')">
    <button
      v-for="code in supportedLocales"
      :key="code"
      type="button"
      class="tirhal-locale__btn"
      :class="{ 'tirhal-locale__btn--active': locale === code }"
      :aria-pressed="locale === code"
      @click="setLocale(code)"
    >
      {{ labelFor(code) }}
    </button>
  </div>
</template>
