<script setup lang="ts">
/**
 * LocaleSwitcher — accessible language selector rendered as a pill trigger
 * that opens a popover/listbox of supported locales.
 *
 * It is the sanctioned UI control for changing locale: it calls `useLocale`
 * (the single owner of `<html lang>`/`<html dir>`). It never touches the
 * document direction directly.
 *
 * Accessibility:
 *  - Trigger is a real `<button>` with `aria-haspopup="listbox"`.
 *  - The popover uses `role="listbox"` with `role="option"` items.
 *  - Closes on Escape, outside-click, and language selection.
 *  - Arrow-key navigation moves the active option; Enter/Space selects.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLocale } from '@/composables/useLocale'
import type { AppLocale } from '@/types/locale'

const { t } = useI18n()
const { locale, supportedLocales, setLocale } = useLocale()

const open = ref(false)
const activeIndex = ref(0)

const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const popoverRef = useTemplateRef<HTMLDivElement>('popover')

const currentLabel = computed(() => t(`localeSwitcher.${locale.value}`))

function labelFor(code: AppLocale): string {
  return t(`localeSwitcher.${code}`)
}

function toggle(): void {
  open.value = !open.value
  if (open.value) {
    activeIndex.value = supportedLocales.indexOf(locale.value)
    void nextTick(() => {
      const opts = popoverRef.value?.querySelectorAll<HTMLDivElement>('[role="option"]')
      opts?.[activeIndex.value]?.focus()
    })
  }
}

function openPopover(): void {
  if (!open.value) toggle()
}

function closePopover(): void {
  if (!open.value) return
  open.value = false
  triggerRef.value?.focus()
}

function selectLocale(code: AppLocale): void {
  setLocale(code)
  closePopover()
}

function handleKeydown(event: KeyboardEvent): void {
  if (!open.value) {
    if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openPopover()
    }
    return
  }

  const lastIndex = supportedLocales.length - 1

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closePopover()
      break
    case 'ArrowDown':
      event.preventDefault()
      activeIndex.value = activeIndex.value >= lastIndex ? 0 : activeIndex.value + 1
      focusOption(activeIndex.value)
      break
    case 'ArrowUp':
      event.preventDefault()
      activeIndex.value = activeIndex.value <= 0 ? lastIndex : activeIndex.value - 1
      focusOption(activeIndex.value)
      break
    case 'Enter':
    case ' ': {
      event.preventDefault()
      const selected = supportedLocales[activeIndex.value]
      if (selected) selectLocale(selected)
      break
    }
  }
}

function focusOption(index: number): void {
  void nextTick(() => {
    const opts = popoverRef.value?.querySelectorAll<HTMLDivElement>('[role="option"]')
    opts?.[index]?.focus()
  })
}

function handleOutsideClick(event: MouseEvent): void {
  if (!open.value) return
  const target = event.target as Node
  if (triggerRef.value?.contains(target)) return
  if (popoverRef.value?.contains(target)) return
  closePopover()
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick, true)
})
</script>

<template>
  <div class="tirhal-locale" @keydown="handleKeydown">
    <button
      ref="trigger"
      type="button"
      class="tirhal-locale__trigger"
      :aria-haspopup="'listbox'"
      :aria-expanded="open"
      :aria-label="t('localeSwitcher.label')"
      @click="toggle"
    >
      <span class="tirhal-locale__trigger-label">{{ currentLabel }}</span>
      <span
        class="tirhal-locale__trigger-caret"
        :class="{ 'tirhal-locale__trigger-caret--open': open }"
        aria-hidden="true"
      />
    </button>

    <div
      v-if="open"
      ref="popover"
      class="tirhal-locale__popover"
      role="listbox"
      :aria-label="t('localeSwitcher.label')"
    >
      <div
        v-for="(code, index) in supportedLocales"
        :key="code"
        role="option"
        class="tirhal-locale__option"
        :class="{ 'tirhal-locale__option--active': locale === code }"
        :aria-selected="locale === code"
        tabindex="0"
        @click="selectLocale(code)"
        @mouseenter="activeIndex = index"
      >
        <span class="tirhal-locale__option-label">{{ labelFor(code) }}</span>
        <span v-if="locale === code" class="tirhal-locale__option-check" aria-hidden="true" />
      </div>
    </div>
  </div>
</template>
