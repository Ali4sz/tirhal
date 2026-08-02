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
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
    </button>
    <button
      type="button"
      class="tirhal-map-control-btn"
      :aria-label="zoomOutLabel"
      :title="zoomOutLabel"
      @click="emit('zoom-out')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14" /></svg>
    </button>
    <button
      type="button"
      class="tirhal-map-control-btn tirhal-map-control-btn--reset"
      :aria-label="resetLabel"
      :title="resetLabel"
      @click="emit('reset')"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8V4m0 0h4M5 4l4 4M19 16v4m0 0h-4m4 0-4-4" />
        <path d="M7.3 17A8 8 0 0 1 7 6.7M16.7 7A8 8 0 0 1 17 17.3" />
      </svg>
    </button>
  </div>
</template>
