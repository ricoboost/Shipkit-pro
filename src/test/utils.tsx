/**
 * Test Utilities
 * Helper functions for testing React components
 */

import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { vi } from 'vitest'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any provider options here
}

function AllTheProviders({ children }: { children: React.ReactNode }) {
  // Wrap with any providers needed for testing
  return <>{children}</>
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions
) {
  return render(ui, { wrapper: AllTheProviders, ...options })
}

// Re-export everything from testing-library
export * from '@testing-library/react'

// Override render with custom render
export { customRender as render }

// Utility to wait for async operations
export function waitForAsync(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Mock fetch helper
export function mockFetch(data: unknown, options?: { status?: number; ok?: boolean }) {
  const { status = 200, ok = true } = options || {}

  return vi.fn().mockResolvedValue({
    ok,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
  })
}

// Create mock request
export function createMockRequest(options?: {
  method?: string
  headers?: Record<string, string>
  body?: unknown
}): Request {
  const { method = 'GET', headers = {}, body } = options || {}

  return new Request('http://localhost:3000', {
    method,
    headers: new Headers(headers),
    body: body ? JSON.stringify(body) : undefined,
  })
}
