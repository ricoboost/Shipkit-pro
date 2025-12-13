/**
 * Utils Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  cn,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  slugify,
  truncate,
  sleep,
  generateId,
  isServer,
  absoluteUrl,
  safeJsonParse,
  capitalize,
  readingTime,
} from '../utils'

describe('cn (className merger)', () => {
  it('should merge class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('should handle conditional classes', () => {
    expect(cn('foo', true && 'bar', false && 'baz')).toBe('foo bar')
  })

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('should handle empty inputs', () => {
    expect(cn()).toBe('')
  })

  it('should handle undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })
})

describe('formatCurrency', () => {
  it('should format USD by default', () => {
    expect(formatCurrency(1000)).toBe('$10.00')
    expect(formatCurrency(9999)).toBe('$99.99')
  })

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00')
  })

  it('should format different currencies', () => {
    expect(formatCurrency(1000, 'EUR', 'de-DE')).toContain('10')
  })

  it('should handle large amounts', () => {
    expect(formatCurrency(100000000)).toBe('$1,000,000.00')
  })
})

describe('formatDate', () => {
  it('should format date with default options', () => {
    const date = new Date('2024-01-15')
    const result = formatDate(date)
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2024')
  })

  it('should accept string dates', () => {
    const result = formatDate('2024-06-20')
    expect(result).toContain('June')
    expect(result).toContain('20')
  })

  it('should accept custom options', () => {
    const result = formatDate('2024-01-15', { year: 'numeric', month: 'short' })
    expect(result).toContain('Jan')
    expect(result).toContain('2024')
  })
})

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return "just now" for recent times', () => {
    const now = new Date()
    vi.setSystemTime(now)
    expect(formatRelativeTime(now)).toBe('just now')
  })

  it('should format minutes ago', () => {
    const now = new Date('2024-01-15T12:05:00')
    vi.setSystemTime(now)
    const fiveMinutesAgo = new Date('2024-01-15T12:00:00')
    expect(formatRelativeTime(fiveMinutesAgo)).toBe('5 minutes ago')
  })

  it('should format hours ago', () => {
    const now = new Date('2024-01-15T14:00:00')
    vi.setSystemTime(now)
    const twoHoursAgo = new Date('2024-01-15T12:00:00')
    expect(formatRelativeTime(twoHoursAgo)).toBe('2 hours ago')
  })

  it('should format days ago', () => {
    const now = new Date('2024-01-15T12:00:00')
    vi.setSystemTime(now)
    const threeDaysAgo = new Date('2024-01-12T12:00:00')
    expect(formatRelativeTime(threeDaysAgo)).toBe('3 days ago')
  })

  it('should format singular correctly', () => {
    const now = new Date('2024-01-15T13:00:00')
    vi.setSystemTime(now)
    const oneHourAgo = new Date('2024-01-15T12:00:00')
    expect(formatRelativeTime(oneHourAgo)).toBe('1 hour ago')
  })
})

describe('slugify', () => {
  it('should convert to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('foo bar baz')).toBe('foo-bar-baz')
  })

  it('should remove special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world')
  })

  it('should handle multiple spaces/hyphens', () => {
    expect(slugify('foo  bar---baz')).toBe('foo-bar-baz')
  })

  it('should trim leading/trailing hyphens', () => {
    expect(slugify('-foo-bar-')).toBe('foo-bar')
  })

  it('should handle empty string', () => {
    expect(slugify('')).toBe('')
  })
})

describe('truncate', () => {
  it('should truncate long text', () => {
    expect(truncate('Hello World', 5)).toBe('Hello...')
  })

  it('should not truncate short text', () => {
    expect(truncate('Hi', 10)).toBe('Hi')
  })

  it('should handle exact length', () => {
    expect(truncate('Hello', 5)).toBe('Hello')
  })

  it('should trim whitespace before ellipsis', () => {
    expect(truncate('Hello World', 6)).toBe('Hello...')
  })
})

describe('sleep', () => {
  it('should wait for specified duration', async () => {
    const start = Date.now()
    await sleep(50)
    const elapsed = Date.now() - start
    expect(elapsed).toBeGreaterThanOrEqual(45)
  })
})

describe('generateId', () => {
  it('should generate default length of 12', () => {
    expect(generateId()).toHaveLength(12)
  })

  it('should generate specified length', () => {
    expect(generateId(8)).toHaveLength(8)
    expect(generateId(20)).toHaveLength(20)
  })

  it('should only contain alphanumeric characters', () => {
    const id = generateId(100)
    expect(id).toMatch(/^[A-Za-z0-9]+$/)
  })

  it('should generate unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('isServer', () => {
  it('should return false in jsdom environment', () => {
    // In jsdom, window is defined
    expect(isServer()).toBe(false)
  })
})

describe('absoluteUrl', () => {
  it('should prepend base URL to path', () => {
    const result = absoluteUrl('/dashboard')
    expect(result).toContain('/dashboard')
  })

  it('should handle paths without leading slash', () => {
    const result = absoluteUrl('dashboard')
    expect(result).toContain('/dashboard')
  })

  it('should use default localhost URL', () => {
    const result = absoluteUrl('/test')
    expect(result).toBe('http://localhost:3000/test')
  })
})

describe('safeJsonParse', () => {
  it('should parse valid JSON', () => {
    expect(safeJsonParse('{"foo":"bar"}', {})).toEqual({ foo: 'bar' })
  })

  it('should return fallback for invalid JSON', () => {
    expect(safeJsonParse('invalid', { default: true })).toEqual({ default: true })
  })

  it('should parse arrays', () => {
    expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3])
  })

  it('should handle null', () => {
    expect(safeJsonParse('null', 'fallback')).toBeNull()
  })
})

describe('capitalize', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(capitalize('')).toBe('')
  })

  it('should handle already capitalized', () => {
    expect(capitalize('Hello')).toBe('Hello')
  })

  it('should only capitalize first letter', () => {
    expect(capitalize('hello world')).toBe('Hello world')
  })
})

describe('readingTime', () => {
  it('should calculate reading time for short text', () => {
    const text = 'word '.repeat(100) // 100 words
    expect(readingTime(text)).toBe(1) // < 1 min rounds up
  })

  it('should calculate reading time for longer text', () => {
    const text = 'word '.repeat(400) // 400 words
    expect(readingTime(text)).toBe(2) // 2 minutes
  })

  it('should use custom words per minute', () => {
    const text = 'word '.repeat(100) // 100 words
    expect(readingTime(text, 100)).toBe(1)
    expect(readingTime(text, 50)).toBe(2)
  })

  it('should handle empty text', () => {
    expect(readingTime('')).toBe(1) // 1 word, rounds to 1 min
  })
})
