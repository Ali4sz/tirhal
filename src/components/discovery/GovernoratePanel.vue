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
import AtlasPlaceholder from '@/components/ui/AtlasPlaceholder.vue'

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

    <div class="tirhal-panel-eyebrow">
      <span>{{ t('app.tagline') }}</span>
      <span class="tirhal-panel-eyebrow__line" aria-hidden="true" />
      <span>{{ areaText }} km²</span>
    </div>
    <h2 class="tirhal-panel-title" data-panel-heading tabindex="-1">{{ govName }}</h2>
    <p v-if="areaText" class="tirhal-panel-meta">
      {{ t('panel.governorate.area') }}: {{ areaText }} km²
    </p>

    <h3 class="tirhal-panel-subtitle">{{ t('panel.governorate.attractions') }}</h3>

    <ul class="tirhal-attraction-list">
      <li v-for="attraction in visibleAttractions" :key="attraction.id">
        <button
          type="button"
          class="tirhal-attraction-item"
          :data-attraction-id="attraction.id"
          @click="selectAttraction(attraction.id)"
        >
          <img
            v-if="attraction.image"
            class="tirhal-attraction-item__thumb"
            :src="attraction.image.src"
            :alt="localized(attraction.image.alt, locale)"
            loading="lazy"
          />
          <AtlasPlaceholder v-else compact :label="t('a11y.decorativePlaceholder')" />
          <span class="tirhal-attraction-item__copy">
            <span class="tirhal-attraction-item__cat">{{
              t(`categories.${attraction.category}`)
            }}</span>
            <span class="tirhal-attraction-item__name">{{
              localized(attraction.name, locale)
            }}</span>
          </span>
          <span class="tirhal-attraction-item__arrow" aria-hidden="true">↗</span>
        </button>
      </li>
      <li v-if="visibleAttractions.length === 0">
        <p class="tirhal-panel-empty">{{ t('panel.governorate.empty') }}</p>
      </li>
    </ul>
  </section>
</template>
