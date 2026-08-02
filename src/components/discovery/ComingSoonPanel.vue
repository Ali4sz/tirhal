<script setup lang="ts">
/**
 * ComingSoonPanel — explicit, named coverage state for a selected governorate
 * that has no launched curated attractions yet. Never shows empty attraction UI.
 */
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useDiscoveryState } from '@/composables/useDiscoveryState'
import { useLocale } from '@/composables/useLocale'
import { localized } from '@/types/tourism'
import AtlasPlaceholder from '@/components/ui/AtlasPlaceholder.vue'

const { t } = useI18n()
const { locale } = useLocale()
const { selectedGovernorate, backToOverview } = useDiscoveryState()

const govName = computed(() =>
  selectedGovernorate.value ? localized(selectedGovernorate.value.name, locale.value) : '',
)
</script>

<template>
  <section class="tirhal-panel-section tirhal-coming-soon">
    <button type="button" class="tirhal-panel-back" @click="backToOverview">
      {{ t('panel.comingSoon.back') }}
    </button>
    <div class="tirhal-panel-eyebrow">{{ t('panel.comingSoon.eyebrow') }}</div>
    <h2 class="tirhal-panel-title" data-panel-heading tabindex="-1">
      {{ t('panel.comingSoon.title') }}
    </h2>
    <p class="tirhal-panel-intro">{{ t('panel.comingSoon.message', { name: govName }) }}</p>
    <AtlasPlaceholder :label="t('a11y.decorativePlaceholder')" />
  </section>
</template>
