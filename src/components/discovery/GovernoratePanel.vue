<script setup lang="ts">
/**
 * GovernoratePanel — shows the selected (supported) governorate's name, area,
 * and its published attraction list. Selecting a list item opens its detail.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import { useLocale } from '@/composables/useLocale'
import { localized } from '@/types/tourism'

const { t } = useI18n()
const { locale, intlLocale } = useLocale()
const { selectedGovernorate, visibleAttractions, selectAttraction, backToOverview } =
  useDiscoveryState()

const govName = computed(() =>
  selectedGovernorate.value ? localized(selectedGovernorate.value.name, locale.value) : '',
)
const areaText = computed(() =>
  selectedGovernorate.value
    ? new Intl.NumberFormat(intlLocale.value).format(Math.round(selectedGovernorate.value.areaSqKm))
    : '',
)
</script>

<template>
  <section class="tirhal-panel-section">
    <button type="button" class="tirhal-panel-back" @click="backToOverview">
      {{ t('panel.governorate.back') }}
    </button>

    <h2 class="tirhal-panel-title">{{ govName }}</h2>
    <p v-if="areaText" class="tirhal-panel-meta">
      {{ t('panel.governorate.area') }}: {{ areaText }} km²
    </p>

    <h3 class="tirhal-panel-subtitle">{{ t('panel.governorate.attractions') }}</h3>

    <ul class="tirhal-attraction-list">
      <li v-for="attraction in visibleAttractions" :key="attraction.id">
        <button type="button" class="tirhal-attraction-item" @click="selectAttraction(attraction.id)">
          <span class="tirhal-attraction-item__name">{{ localized(attraction.name, locale) }}</span>
          <span class="tirhal-attraction-item__cat">{{ t(`categories.${attraction.category}`) }}</span>
        </button>
      </li>
      <li v-if="visibleAttractions.length === 0">
        <p class="tirhal-panel-empty">{{ t('panel.governorate.empty') }}</p>
      </li>
    </ul>
  </section>
</template>
