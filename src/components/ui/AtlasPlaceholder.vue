<script setup lang="ts">
withDefaults(
  defineProps<{
    compact?: boolean
    label?: string
  }>(),
  {
    compact: false,
    label: '',
  },
)
</script>

<template>
  <div
    class="tirhal-placeholder"
    :class="{ 'tirhal-placeholder--compact': compact }"
    role="img"
    :aria-label="label"
  >
    <svg class="tirhal-placeholder__art" viewBox="0 0 480 300" aria-hidden="true">
      <path class="tirhal-placeholder__sun" d="M0 0h480v300H0z" />
      <circle class="tirhal-placeholder__disc" cx="355" cy="70" r="36" />
      <path
        class="tirhal-placeholder__ridge tirhal-placeholder__ridge--back"
        d="M0 193 81 129l67 47 72-91 71 93 61-44 128 83v83H0Z"
      />
      <path
        class="tirhal-placeholder__ridge tirhal-placeholder__ridge--front"
        d="M0 232 105 178l67 45 93-78 92 75 49-27 74 38v69H0Z"
      />
      <path
        class="tirhal-placeholder__arch"
        d="M181 238v-67c0-44 26-72 59-72s59 28 59 72v67h-35v-67c0-20-10-34-24-34s-24 14-24 34v67Z"
      />
      <g class="tirhal-placeholder__contours">
        <path d="M-13 60c67-43 134-40 199 9s134 51 207 6 126-42 159-20" />
        <path d="M-18 89c71-36 135-31 194 15s123 52 193 13 127-38 169-13" />
        <path d="M-19 120c77-31 139-22 188 20s112 53 181 22 127-31 180-1" />
      </g>
    </svg>
    <span class="tirhal-placeholder__mark" aria-hidden="true">TRH · 01</span>
  </div>
</template>
