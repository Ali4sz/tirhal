<script setup lang="ts">
/**
 * AttractionDetailPanel — renders one selected attraction's localized text,
 * category, source, and review date, with a close action (back to the
 * governorate list) and a locate-on-map action.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import { useLocale } from '@/composables/useLocale'
import { localized } from '@/types/tourism'

const { t } = useI18n()
const { locale, intlLocale } = useLocale()
const { selectedAttraction, clearAttractionSelection, requestLocate } = useDiscoveryState()

const name = computed(() =>
  selectedAttraction.value ? localized(selectedAttraction.value.name, locale.value) : '',
)
const description = computed(() =>
  selectedAttraction.value ? localized(selectedAttraction.value.description, locale.value) : '',
)
const category = computed(() =>
  selectedAttraction.value ? t(`categories.${selectedAttraction.value.category}`) : '',
)
const imageSrc = computed(() => selectedAttraction.value?.image?.src ?? '')
const imageAlt = computed(() =>
  selectedAttraction.value?.image ? localized(selectedAttraction.value.image.alt, locale.value) : '',
)
const sourceLabel = computed(() =>
  selectedAttraction.value ? localized(selectedAttraction.value.source.label, locale.value) : '',
)
const reviewedText = computed(() => {
  if (!selectedAttraction.value) return ''
  const date = new Date(selectedAttraction.value.reviewedOn)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(intlLocale.value, { dateStyle: 'medium' }).format(date)
})
</script>

<template>
  <section class="tirhal-panel-section">
    <button type="button" class="tirhal-panel-back" @click="clearAttractionSelection">
      {{ t('panel.attraction.close') }}
    </button>

    <h2 class="tirhal-panel-title">{{ name }}</h2>
    <p class="tirhal-attraction-cat">{{ category }}</p>
    <img v-if="imageSrc" class="tirhal-attraction-image" :src="imageSrc" :alt="imageAlt" />
    <p class="tirhal-panel-intro">{{ description }}</p>

    <dl class="tirhal-attraction-meta">
      <div class="tirhal-attraction-meta__row">
        <dt>{{ t('panel.attraction.source') }}</dt>
        <dd>{{ sourceLabel }}</dd>
      </div>
      <div v-if="reviewedText" class="tirhal-attraction-meta__row">
        <dt>{{ t('panel.attraction.reviewedOn') }}</dt>
        <dd>{{ reviewedText }}</dd>
      </div>
    </dl>

    <button type="button" class="tirhal-attraction-locate" @click="requestLocate">
      {{ t('panel.attraction.locate') }}
    </button>
  </section>
</template>
