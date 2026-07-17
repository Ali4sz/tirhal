import { test, expect } from '@playwright/test'

test('full discovery journey + RTL', async ({ page }) => {
  const errors: string[] = []
  const warnings: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
    if (m.type() === 'warning') warnings.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('/')

  // Wait for the map (and its vector features) to be ready.
  await page.locator('.tirhal-map canvas').waitFor({ state: 'visible' })
  await page.waitForTimeout(1200)

  // Overview
  await expect(page.getByRole('heading', { name: 'Explore Syria' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'English', pressed: true })).toBeVisible()

  const map = page.locator('.tirhal-map')
  const panel = page.locator('.tirhal-app__panel')

  // Exercise governorate hover hit testing without Canvas2D pixel readback.
  await map.hover()

  // In LTR, the panel sits at the inline-end (right of the map).
  const enPanel = await panel.boundingBox()
  const enMap = await map.boundingBox()
  expect(enPanel!.x).toBeGreaterThan(enMap!.x)

  // --- Coming soon: scan the map; reset to overview between hits so the
  //     all-Syria view is preserved for the next probe. We wait for the panel
  //     <h2> to change away from the overview state before reading it. ---
  const box = (await map.boundingBox())!
  const panelTitle = page.locator('.tirhal-panel-title')
  let comingSoon = false
  outer: for (let i = 0; i < 6 && !comingSoon; i++) {
    for (let j = 0; j < 6; j++) {
      const x = ((i + 0.5) / 6) * box.width
      const y = ((j + 0.5) / 6) * box.height
      if (x > box.width - 70 && y < 170) continue // skip zoom controls
      await map.click({ position: { x, y } })
      let title = 'Explore Syria'
      try {
        await expect(panelTitle).not.toHaveText('Explore Syria', { timeout: 800 })
        title = (await panelTitle.textContent())?.trim() ?? ''
      } catch {
        title = (await panelTitle.textContent())?.trim() ?? ''
      }
      if (title === 'Coming soon') {
        comingSoon = true
        break outer
      }
      // Landed on a supported governorate list -> go back to keep the full view.
      if (title && title !== 'Explore Syria') {
        await page.getByRole('button', { name: 'Back to overview' }).click()
        await expect(page.getByRole('heading', { name: 'Explore Syria' })).toBeVisible()
      }
    }
  }
  expect(comingSoon, 'expected a Coming soon panel for an unsupported governorate').toBe(true)
  await expect(page.getByRole('button', { name: 'Back to overview' })).toBeVisible()
  await page.getByRole('button', { name: 'Back to overview' }).click()
  await expect(page.getByRole('heading', { name: 'Explore Syria' })).toBeVisible()

  // --- Supported flow: click center -> governorate list -> attraction detail. ---
  await map.click()
  const firstItem = page.locator('.tirhal-attraction-item').first()
  await expect(firstItem).toBeVisible()

  await firstItem.click()
  await expect(page.getByRole('button', { name: 'Locate on map' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Close' })).toBeVisible()

  await page.getByRole('button', { name: 'Locate on map' }).click()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(firstItem).toBeVisible()

  await page.getByRole('button', { name: 'Back to overview' }).click()
  await expect(page.getByRole('heading', { name: 'Explore Syria' })).toBeVisible()

  // --- Switch to Arabic: root lang/dir update, UI translates, panel flips left. ---
  await page.getByRole('button', { name: 'العربية' }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar')
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl')
  await expect(page.getByRole('heading', { name: 'استكشف سوريا' })).toBeVisible()

  const arPanel = await panel.boundingBox()
  const arMap = await map.boundingBox()
  expect(arPanel!.x).toBeLessThan(arMap!.x)

  expect(errors, `console/page errors:\n${errors.join('\n')}`).toEqual([])
  expect(warnings.filter((warning) => warning.includes('willReadFrequently'))).toEqual([])
})
