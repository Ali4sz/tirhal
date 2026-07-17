<script setup lang="ts">
/**
 * MapControls — accessible zoom and reset buttons for the discovery map.
 *
 * Purely presentational: it emits intents and owns no map or domain logic.
 * Placement is logical (inline-end) via CSS so it follows document direction.
 */
defineProps<{
  zoomInLabel: string
  zoomOutLabel: string
  resetLabel: string
}>()

const emit = defineEmits<{
  (e: 'zoom-in'): void
  (e: 'zoom-out'): void
  (e: 'reset'): void
}>()
</script>

<template>
  <div class="tirhal-map-controls">
    <button
      type="button"
      class="tirhal-map-control-btn"
      :aria-label="zoomInLabel"
      :title="zoomInLabel"
      @click="emit('zoom-in')"
    >
      <span aria-hidden="true">+</span>
    </button>
    <button
      type="button"
      class="tirhal-map-control-btn"
      :aria-label="zoomOutLabel"
      :title="zoomOutLabel"
      @click="emit('zoom-out')"
    >
      <span aria-hidden="true">−</span>
    </button>
    <button
      type="button"
      class="tirhal-map-control-btn tirhal-map-control-btn--reset"
      :aria-label="resetLabel"
      :title="resetLabel"
      @click="emit('reset')"
    >
      <span aria-hidden="true">⤾</span>
    </button>
  </div>
</template>
