<script setup lang="ts">
/**
 * AppHeader — floating chrome overlay: the brand identity pill.
 *
 * It owns no discovery or map state and renders no conventional header bar; it
 * floats transparently over the map surface. The locale switcher lives inside
 * the discovery drawer (see `DiscoveryPanel`), not here.
 */
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <header class="tirhal-app__header">
    <div class="tirhal-brand" aria-label="Tirhal">
      <span class="tirhal-brand__seal" aria-hidden="true">
        <svg viewBox="0 0 512 512">
          <defs>
            <path id="tirhal-band" d="M -210 0 L -140 -90 L 140 -90 L 210 0 L 140 90 L -140 90 Z"/>
          </defs>
          <!-- Islamic rosette · primary terracotta -->
          <g transform="translate(256 256)" fill="none" stroke-width="10"
             stroke="var(--md-sys-color-primary, #c75b39)">
            <use href="#tirhal-band"/>
            <use href="#tirhal-band" transform="rotate(30)"/>
            <use href="#tirhal-band" transform="rotate(60)"/>
            <use href="#tirhal-band" transform="rotate(90)"/>
            <use href="#tirhal-band" transform="rotate(120)"/>
            <use href="#tirhal-band" transform="rotate(150)"/>
          </g>
          <!-- Phoenician boat · secondary wood-brown lines, accent sail -->
          <g transform="translate(256 256)" fill="none" stroke-width="10"
             stroke="var(--md-sys-color-secondary, #8b5a2b)"
             stroke-linecap="round" stroke-linejoin="round">
            <path d="M -58 4 Q 0 64 58 4 Q 0 28 -58 4 Z"/>
            <path d="M -58 4 Q -68 -6 -63 -18"/>
            <path d="M 58 4 Q 70 -8 65 -19 Q 63 -26 55 -26"/>
            <path d="M 0 16 L 0 -22"/>
            <path d="M -32 -52 Q 0 -62 32 -52 L 24 -16 Q 0 -26 -24 -16 Z"
                  fill="var(--tirhal-color-accent, #e89b3e)"/>
          </g>
        </svg>
      </span>
      <span class="tirhal-brand__copy">
        <strong class="tirhal-brand__name">{{ t('app.name') }}</strong>
        <span class="tirhal-brand__tagline">{{ t('app.tagline') }}</span>
      </span>
    </div>
  </header>
</template>
