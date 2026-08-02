<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import { useLocale } from '@/composables/useLocale'
import { getGovernorates } from '@/repositories/tourismRepository'
import { localized } from '@/types/tourism'

const { t } = useI18n()
const { locale } = useLocale()
const { selectGovernorate } = useDiscoveryState()
const governorates = getGovernorates()
const sortedGovernorates = computed(() =>
  [...governorates].sort((first, second) => {
    if (first.coverage !== second.coverage) return first.coverage === 'supported' ? -1 : 1
    return localized(first.name, locale.value).localeCompare(
      localized(second.name, locale.value),
      locale.value,
    )
  }),
)
</script>

<template>
  <div class="tirhal-region-nav">
    <h3 class="tirhal-panel-subtitle">{{ t('panel.overview.regionList') }}</h3>
    <ul class="tirhal-region-nav__list">
      <li v-for="governorate in sortedGovernorates" :key="governorate.id">
        <button
          type="button"
          class="tirhal-region-nav__button"
          :class="{ 'tirhal-region-nav__button--available': governorate.coverage === 'supported' }"
          :data-governorate-id="governorate.id"
          @click="selectGovernorate(governorate.id)"
        >
          <span>{{ localized(governorate.name, locale) }}</span>
          <span class="tirhal-region-nav__status">
            {{
              t(
                governorate.coverage === 'supported'
                  ? 'panel.overview.available'
                  : 'panel.overview.soon',
              )
            }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>
