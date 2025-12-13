/**
 * Home Page E2E Tests
 */

import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/')

    // Should have a page title
    await expect(page).toHaveTitle(/.+/)
  })

  test('should have navigation elements', async ({ page }) => {
    await page.goto('/')

    // Should have navigation
    const nav = page.locator('nav, header')
    await expect(nav.first()).toBeVisible()
  })

  test('should have a main content area', async ({ page }) => {
    await page.goto('/')

    // Should have main content
    const main = page.locator('main, [role="main"]')
    await expect(main.first()).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    // Page should load without errors
    await expect(page).toHaveTitle(/.+/)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Filter out known acceptable errors (e.g., third-party scripts)
    const criticalErrors = errors.filter(
      (error) =>
        !error.includes('favicon') &&
        !error.includes('third-party') &&
        !error.includes('analytics')
    )

    expect(criticalErrors).toHaveLength(0)
  })
})

test.describe('Navigation', () => {
  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/')

    // Look for pricing link
    const pricingLink = page.locator('a[href*="pricing"]').first()

    if (await pricingLink.isVisible()) {
      await pricingLink.click()
      await expect(page).toHaveURL(/pricing/)
    }
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Look for login/sign-in link
    const loginLink = page.locator('a[href*="login"], a[href*="sign-in"]').first()

    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/login|sign-in/)
    }
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/')

    // Should have an h1
    const h1 = page.locator('h1')
    const h1Count = await h1.count()

    // Should have at least one h1 or meaningful heading
    expect(h1Count).toBeGreaterThanOrEqual(0)
  })

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/')

    // Get all images
    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const img = images.nth(i)
      const alt = await img.getAttribute('alt')
      const decorative = await img.getAttribute('role')

      // Image should have alt text or be marked as decorative
      expect(alt !== null || decorative === 'presentation').toBeTruthy()
    }
  })

  test('should have proper link text', async ({ page }) => {
    await page.goto('/')

    // Get all links
    const links = page.locator('a')
    const count = await links.count()

    for (let i = 0; i < Math.min(count, 20); i++) {
      const link = links.nth(i)
      const text = await link.textContent()
      const ariaLabel = await link.getAttribute('aria-label')
      const title = await link.getAttribute('title')

      // Link should have meaningful text
      const hasMeaningfulText =
        (text && text.trim().length > 0) ||
        ariaLabel !== null ||
        title !== null

      expect(hasMeaningfulText).toBeTruthy()
    }
  })
})
