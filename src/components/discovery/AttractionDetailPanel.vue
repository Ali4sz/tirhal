<script setup lang="ts">
/**
 * AttractionDetailPanel — renders one selected attraction: image, category,
 * description, annual visitors, best time to visit, provenance, and a
 * locate-on-map action, plus a close action back to the governorate list.
 *
 * Visitor figures and seasonal guidance are optional in the domain contract, so
 * both sections are guarded — a record without curated data renders nothing
 * rather than an empty shell. Provisional figures always show their caveat.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import { useLocale } from '@/composables/useLocale'
import { localized } from '@/types/tourism'
import AtlasPlaceholder from '@/components/ui/AtlasPlaceholder.vue'

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
  selectedAttraction.value?.image
    ? localized(selectedAttraction.value.image.alt, locale.value)
    : '',
)
const sourceUrl = computed(() => selectedAttraction.value?.source.url ?? '')

// --- Annual visitors -------------------------------------------------------
const visitors = computed(() => selectedAttraction.value?.visitors)

/** Compact notation keeps large figures readable and localizes the unit. */
const visitorsText = computed(() => {
  const estimate = visitors.value
  if (!estimate) return ''
  return new Intl.NumberFormat(intlLocale.value, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(estimate.annual)
})

const visitorsNote = computed(() =>
  visitors.value ? localized(visitors.value.note, locale.value) : '',
)
const visitorsIsProvisional = computed(() => visitors.value?.confidence === 'provisional')

// --- Best time to visit ----------------------------------------------------
const bestTime = computed(() => selectedAttraction.value?.bestTimeToVisit)

const bestTimeLabel = computed(() =>
  bestTime.value ? localized(bestTime.value.label, locale.value) : '',
)

/**
 * Month numbers (1-12) rendered as localized short month names. A fixed
 * reference year keeps formatting deterministic and independent of "now".
 */
const bestTimeMonths = computed(() => {
  const months = bestTime.value?.months
  if (!months) return []
  const formatter = new Intl.DateTimeFormat(intlLocale.value, { month: 'short' })
  return months.map((month) => ({
    key: month,
    label: formatter.format(new Date(Date.UTC(2024, month - 1, 1))),
  }))
})

// --- Provenance ------------------------------------------------------------
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
  <section class="tirhal-panel-section tirhal-attraction-story">
    <button type="button" class="tirhal-panel-back" @click="clearAttractionSelection">
      {{ t('panel.attraction.close') }}
    </button>

    <div class="tirhal-attraction-story__media">
      <img v-if="imageSrc" class="tirhal-attraction-image" :src="imageSrc" :alt="imageAlt" />
      <AtlasPlaceholder v-else :label="t('a11y.decorativePlaceholder')" />
      <span class="tirhal-attraction-story__media-index" aria-hidden="true">TRH / SY</span>
    </div>

    <div class="tirhal-panel-eyebrow">{{ t('panel.attraction.story') }}</div>
    <h2 class="tirhal-panel-title" data-panel-heading tabindex="-1">{{ name }}</h2>
    <p class="tirhal-attraction-cat"><span aria-hidden="true">✦</span> {{ category }}</p>
    <p class="tirhal-panel-intro">{{ description }}</p>

    <!-- Annual visitors: a prominent stat, with its caveat when provisional. -->
    <div v-if="visitors" class="tirhal-stat">
      <span class="tirhal-stat__label">{{ t('panel.attraction.visitors') }}</span>
      <span class="tirhal-stat__value">
        {{ visitorsText }}
        <span class="tirhal-stat__qualifier">{{ t('panel.attraction.visitorsEstimate') }}</span>
      </span>
      <p v-if="visitorsIsProvisional" class="tirhal-stat__note">{{ visitorsNote }}</p>
    </div>

    <!-- Best time to visit: season summary plus month chips. -->
    <div v-if="bestTime" class="tirhal-besttime">
      <h3 class="tirhal-panel-subtitle">{{ t('panel.attraction.bestTime') }}</h3>
      <p class="tirhal-besttime__label">{{ bestTimeLabel }}</p>
      <ul class="tirhal-chip-set" :aria-label="t('a11y.monthsLabel')">
        <li v-for="month in bestTimeMonths" :key="month.key" class="tirhal-chip">
          {{ month.label }}
        </li>
      </ul>
    </div>

    <dl class="tirhal-attraction-meta">
      <div class="tirhal-attraction-meta__row">
        <dt>{{ t('panel.attraction.source') }}</dt>
        <dd>
          <a v-if="sourceUrl" :href="sourceUrl" target="_blank" rel="noopener noreferrer">
            {{ sourceLabel }}
            <span class="tirhal-sr-only">— {{ t('panel.attraction.sourceLink') }}</span>
          </a>
          <span v-else>{{ sourceLabel }}</span>
        </dd>
      </div>
      <div v-if="reviewedText" class="tirhal-attraction-meta__row">
        <dt>{{ t('panel.attraction.reviewedOn') }}</dt>
        <dd>{{ reviewedText }}</dd>
      </div>
    </dl>

    <button type="button" class="tirhal-attraction-locate" @click="requestLocate">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21s6-5.3 6-11a6 6 0 1 0-12 0c0 5.7 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2" />
      </svg>
      <span>{{ t('panel.attraction.locate') }}</span>
    </button>
  </section>
</template>
