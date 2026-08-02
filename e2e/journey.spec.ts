import { expect, test } from '@playwright/test'
import type { Page } from '@playwright/test'

const SUPPORTED_GOVERNORATE_ID = 'SY01'
const COMING_SOON_GOVERNORATE_ID = 'SY02'

async function waitForMap(page: Page): Promise<void> {
  await expect(page.getByTestId('map-root')).toBeVisible()
  await expect(page.getByTestId('map-root').locator('canvas').first()).toBeVisible()
}

function governorateButton(page: Page, id: string) {
  return page.locator(`[data-governorate-id="${id}"]`)
}

test('full discovery journey and Arabic RTL', async ({ page }) => {
  const errors: string[] = []
  const warnings: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
    if (message.type() === 'warning') warnings.push(message.text())
  })
  page.on('pageerror', (error) => errors.push(error.message))

  await page.goto('/')
  await waitForMap(page)

  await expect(page.getByRole('heading', { name: 'Welcome to Tirhal' })).toBeVisible()
  await expect(page.getByRole('main', { name: 'Interactive map of Syria' })).toBeVisible()

  await governorateButton(page, COMING_SOON_GOVERNORATE_ID).click()
  await expect(page.getByRole('heading', { name: 'Coming soon' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to overview' }).click()

  await governorateButton(page, SUPPORTED_GOVERNORATE_ID).click()
  const firstAttraction = page.locator('[data-attraction-id]').first()
  await expect(firstAttraction).toBeVisible()
  await firstAttraction.click()

  await expect(page.getByRole('button', { name: 'Locate on map' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible()
  await expect(page.getByText('Annual visitors', { exact: true })).toBeVisible()
  await expect(page.locator('.tirhal-stat__note')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Best time to visit' })).toBeVisible()
  await expect(page.locator('.tirhal-placeholder')).toBeVisible()

  await page.getByRole('button', { name: 'Locate on map' }).click()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(firstAttraction).toBeVisible()
  await page.getByRole('button', { name: 'Back to overview' }).click()

  const localeTrigger = page.getByRole('button', { name: 'Language' })
  await localeTrigger.click()
  await page.getByRole('option', { name: 'العربية' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: 'أهلاً بك في تِرحال' })).toBeVisible()
  await expect(page.getByRole('main', { name: 'خريطة تفاعلية لسوريا' })).toBeVisible()

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([])
  expect(warnings.filter((warning) => warning.includes('willReadFrequently'))).toEqual([])
})

test('desktop editorial surface collapses and reopens', async ({ page }) => {
  await page.goto('/')
  await waitForMap(page)

  const handle = page.getByRole('button', { name: 'Collapse information panel' })
  await expect(handle).toHaveAttribute('aria-expanded', 'true')
  await handle.click()

  const expandHandle = page.getByRole('button', { name: 'Expand information panel' })
  await expect(expandHandle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('#tirhal-drawer-content')).toBeHidden()
  await expandHandle.click()
  await expect(page.getByRole('heading', { name: 'Welcome to Tirhal' })).toBeVisible()
})

test('compact bottom sheet reveals selected content and supports keyboard locale selection', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await waitForMap(page)

  const expandHandle = page.getByRole('button', { name: 'Expand information panel' })
  await expect(expandHandle).toHaveAttribute('aria-expanded', 'false')
  await expandHandle.click()
  await expect(page.getByRole('heading', { name: 'Welcome to Tirhal' })).toBeVisible()

  await governorateButton(page, SUPPORTED_GOVERNORATE_ID).click()
  await expect(page.locator('[data-attraction-id]').first()).toBeVisible()

  const localeTrigger = page.getByRole('button', { name: 'Language' })
  await localeTrigger.focus()
  await page.keyboard.press('Enter')
  await expect(page.getByRole('listbox', { name: 'Language' })).toBeVisible()
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('button', { name: 'اللغة' })).toBeFocused()
})

test('reduced motion keeps the journey functional', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await waitForMap(page)
  await governorateButton(page, SUPPORTED_GOVERNORATE_ID).click()
  await page.locator('[data-attraction-id]').first().click()
  await expect(page.getByRole('button', { name: 'Locate on map' })).toBeVisible()
})

test('visual atlas states remain composed', async ({ page, browserName }) => {
  test.skip(browserName !== 'chromium', 'Chromium owns deterministic visual baselines')
  test.skip(!process.env.CI, 'Production preview owns deterministic visual baselines')
  await page.setViewportSize({ width: 1440, height: 960 })
  await page.goto('/')
  await waitForMap(page)
  await expect(page).toHaveScreenshot('atlas-overview-desktop.png', {
    animations: 'disabled',
    mask: [page.getByTestId('map-root').locator('canvas')],
  })

  await governorateButton(page, SUPPORTED_GOVERNORATE_ID).click()
  await page.locator('[data-attraction-id]').first().click()
  await expect(page).toHaveScreenshot('atlas-attraction-desktop.png', {
    animations: 'disabled',
    mask: [page.getByTestId('map-root').locator('canvas')],
  })
})
