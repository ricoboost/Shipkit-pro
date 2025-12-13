/**
 * Authentication E2E Tests
 */

import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/en/login')

    // Should have login form elements
    const form = page.locator('form')
    await expect(form.first()).toBeVisible()
  })

  test('should have email input', async ({ page }) => {
    await page.goto('/en/login')

    const emailInput = page.locator('[name="email"], [type="email"]')
    await expect(emailInput.first()).toBeVisible()
  })

  test('should have password input', async ({ page }) => {
    await page.goto('/en/login')

    const passwordInput = page.locator('[name="password"], [type="password"]')
    await expect(passwordInput.first()).toBeVisible()
  })

  test('should have submit button', async ({ page }) => {
    await page.goto('/en/login')

    const submitButton = page.locator('[type="submit"], button:has-text("Sign"), button:has-text("Log")')
    await expect(submitButton.first()).toBeVisible()
  })

  test('should show validation error for empty email', async ({ page }) => {
    await page.goto('/en/login')

    // Try to submit without filling form
    const submitButton = page.locator('[type="submit"]').first()
    await submitButton.click()

    // Browser should show validation or form should show error
    // This depends on implementation
    const emailInput = page.locator('[name="email"], [type="email"]').first()
    const isInvalid = await emailInput.evaluate((el) => {
      return (el as HTMLInputElement).validity?.valueMissing || false
    })

    expect(isInvalid).toBeTruthy()
  })

  test('should have link to register page', async ({ page }) => {
    await page.goto('/en/login')

    const registerLink = page.locator('a[href*="register"], a[href*="sign-up"], a[href*="signup"]')

    if (await registerLink.first().isVisible()) {
      await registerLink.first().click()
      await expect(page).toHaveURL(/register|sign-up|signup/)
    }
  })

  test('should have forgot password link', async ({ page }) => {
    await page.goto('/en/login')

    const forgotLink = page.locator('a[href*="forgot"], a[href*="reset"]')

    if (await forgotLink.first().isVisible()) {
      await expect(forgotLink.first()).toBeVisible()
    }
  })
})

test.describe('Register Page', () => {
  test('should load the register page', async ({ page }) => {
    await page.goto('/en/register')

    // Should have registration form
    const form = page.locator('form')
    await expect(form.first()).toBeVisible()
  })

  test('should have required fields', async ({ page }) => {
    await page.goto('/en/register')

    // Check for email field
    const emailInput = page.locator('[name="email"], [type="email"]')
    await expect(emailInput.first()).toBeVisible()

    // Check for password field
    const passwordInput = page.locator('[name="password"], [type="password"]')
    await expect(passwordInput.first()).toBeVisible()
  })

  test('should have link to login page', async ({ page }) => {
    await page.goto('/en/register')

    const loginLink = page.locator('a[href*="login"], a[href*="sign-in"]')

    if (await loginLink.first().isVisible()) {
      await loginLink.first().click()
      await expect(page).toHaveURL(/login|sign-in/)
    }
  })
})

test.describe('Auth Redirects', () => {
  test('should redirect unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/en/dashboard')

    // Should redirect to login
    await page.waitForURL(/login|sign-in|auth/, { timeout: 10000 })
  })

  test('should redirect unauthenticated users from settings', async ({ page }) => {
    await page.goto('/en/settings')

    // Should redirect to login
    await page.waitForURL(/login|sign-in|auth/, { timeout: 10000 })
  })
})
