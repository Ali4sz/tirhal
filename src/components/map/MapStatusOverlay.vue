<script setup lang="ts">
/**
 * MapStatusOverlay — non-essential, polite status text for the map.
 *
 * Shows the currently selected governorate, or the hovered one as a preview.
 * Uses `aria-live="polite"` so assistive tech announces changes without
 * interrupting. It never mirrors map geometry — only this UI chrome adapts.
 */
defineProps<{
  hoverName: string | null
  selectedName: string | null
  hoverLabel: string
  selectedLabel: string
}>()
</script>

<template>
  <div class="tirhal-map-status" role="status" aria-live="polite">
    <p v-if="selectedName" class="tirhal-map-status__line">
      <span class="tirhal-map-status__label">{{ selectedLabel }}</span> {{ selectedName }}
    </p>
    <p v-else-if="hoverName" class="tirhal-map-status__line">
      <span class="tirhal-map-status__label">{{ hoverLabel }}</span> {{ hoverName }}
    </p>
  </div>
</template>
