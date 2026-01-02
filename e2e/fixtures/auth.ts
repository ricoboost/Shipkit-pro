/**
 * Authentication Fixtures for E2E Tests
 */

import { test as base, expect } from '@playwright/test'

// Test user credentials
export const testUser = {
  email: 'test@example.com',
  password: 'TestPassword123!',
  name: 'Test User',
}

// Extend base test with auth fixtures
export const test = base.extend<{
  authenticatedPage: typeof base
}>({
  // Placeholder for authenticated page fixture
  // Will be implemented when auth is set up in test environment
  authenticatedPage: async ({ page: _page }, use) => {
    // For now, just use the regular page
    await use(base)
  },
})

export { expect }

// Helper to fill login form
export async function fillLoginForm(
  page: import('@playwright/test').Page,
  email: string,
  password: string
) {
  await page.fill('[name="email"], [type="email"]', email)
  await page.fill('[name="password"], [type="password"]', password)
}

// Helper to submit form
export async function submitForm(page: import('@playwright/test').Page) {
  await page.click('[type="submit"]')
}

// Helper to wait for navigation
export async function waitForNavigation(page: import('@playwright/test').Page) {
  await page.waitForLoadState('networkidle')
}
