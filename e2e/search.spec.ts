import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

/**
 * Attraction search coverage: fuzzy English queries, unvocalized Arabic
 * queries in RTL, category keywords, keyboard-only selection, the no-results
 * state, and compact-viewport reachability. Mirrors `journey.spec.ts`
 * conventions: role-based selectors, `data-attraction-id` hooks, and strict
 * no-console-error assertions.
 */

async function waitForMap(page: Page): Promise<void> {
  await expect(page.getByTestId('map-root')).toBeVisible()
  await expect(page.getByTestId('map-root').locator('canvas').first()).toBeVisible()
}

function searchInput(page: Page) {
  return page.getByRole('combobox', { name: 'Search attractions' })
}

function collectErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))
  return errors
}

test('fuzzy English query finds and opens an attraction', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await waitForMap(page)

  // "umayad" is one typo away from the dataset's "Umayyad".
  await searchInput(page).fill('umayad')
  await expect(page.getByRole('option', { name: /Umayyad Mosque/ })).toBeVisible()

  await searchInput(page).press('Enter')
  await expect(page.getByRole('heading', { name: 'Umayyad Mosque' })).toBeVisible()
  await expect(searchInput(page)).toHaveValue('')

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([])
})

test('unvocalized Arabic query works in RTL mode', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await waitForMap(page)

  const localeTrigger = page.getByRole('button', { name: 'Language' })
  await localeTrigger.click()
  await page.getByRole('option', { name: 'العربية' }).click()
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')

  // Unvocalized, hamza-free form of «الجامع الأموي».
  const input = page.getByRole('combobox', { name: 'البحث عن معالم' })
  await input.fill('الاموي')
  await expect(page.getByRole('option', { name: /الجامع الأموي/ })).toBeVisible()

  await input.press('Enter')
  await expect(page.getByRole('heading', { name: 'الجامع الأموي' })).toBeVisible()

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([])
})

test('category keywords surface attractions whose names lack the term', async ({ page }) => {
  await page.goto('/')
  await waitForMap(page)

  // "Krak des Chevaliers" contains neither "castle" nor «قلعة» in English;
  // only the historical-category keyword surfaces it.
  await searchInput(page).fill('castle')
  await expect(page.getByRole('option', { name: /Krak des Chevaliers/ })).toBeVisible()

  await searchInput(page).fill('zzzzz')
  await expect(page.getByRole('listbox')).toHaveCount(0)
  // The visible empty state; the same text is also politely announced by the
  // sr-only status region, so a bare getByText would be ambiguous.
  await expect(page.locator('.tirhal-search__empty')).toBeVisible()
})

test('keyboard navigation selects an option without a pointer', async ({ page }) => {
  await page.goto('/')
  await waitForMap(page)

  const input = searchInput(page)
  await input.pressSequentially('castle')
  const listbox = page.getByRole('listbox', { name: 'Search attractions' })
  await expect(listbox).toBeVisible()

  // First result is highlighted by default; one ArrowDown moves to the second
  // ("Citadel of Damascus", per the deterministic ranking contract).
  await input.press('ArrowDown')
  await expect(input).toHaveAttribute('aria-activedescendant', 'tirhal-search-option-1')
  await input.press('Enter')
  await expect(page.getByRole('heading', { name: 'Citadel of Damascus' })).toBeVisible()

  // Escape clears the query and closes the listbox.
  await input.fill('castle')
  await expect(listbox).toBeVisible()
  await input.press('Escape')
  await expect(listbox).toHaveCount(0)
  await expect(input).toHaveValue('')
})

test('search stays reachable on compact viewports', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 640 })
  await page.goto('/')
  await waitForMap(page)

  const input = searchInput(page)
  await expect(input).toBeVisible()

  await input.fill('umayad')
  await expect(page.getByRole('option', { name: /Umayyad Mosque/ })).toBeVisible()
  await input.press('Enter')

  // The drawer auto-expands for the attraction panel on compact viewports.
  await expect(page.getByRole('heading', { name: 'Umayyad Mosque' })).toBeVisible()
})
