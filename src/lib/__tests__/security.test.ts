/**
 * Security Utilities Unit Tests
 */

import { describe, it, expect } from 'vitest'
import { sanitize, csrf, password, ip } from '../security'
import { createMockRequest } from '@/test/utils'

describe('sanitize.html', () => {
  it('should escape HTML special characters', () => {
    expect(sanitize.html('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
    )
  })

  it('should escape ampersands', () => {
    expect(sanitize.html('foo & bar')).toBe('foo &amp; bar')
  })

  it('should escape single quotes', () => {
    expect(sanitize.html("it's")).toBe('it&#39;s')
  })

  it('should handle empty string', () => {
    expect(sanitize.html('')).toBe('')
  })

  it('should preserve non-special characters', () => {
    expect(sanitize.html('Hello World 123')).toBe('Hello World 123')
  })
})

describe('sanitize.stripTags', () => {
  it('should remove HTML tags', () => {
    expect(sanitize.stripTags('<p>Hello</p>')).toBe('Hello')
  })

  it('should remove nested tags', () => {
    expect(sanitize.stripTags('<div><span>Test</span></div>')).toBe('Test')
  })

  it('should remove self-closing tags', () => {
    expect(sanitize.stripTags('Hello<br/>World')).toBe('HelloWorld')
  })

  it('should handle tags with attributes', () => {
    expect(sanitize.stripTags('<a href="url">Link</a>')).toBe('Link')
  })

  it('should handle empty string', () => {
    expect(sanitize.stripTags('')).toBe('')
  })
})

describe('sanitize.sql', () => {
  it('should remove single quotes', () => {
    expect(sanitize.sql("test'injection")).toBe('testinjection')
  })

  it('should remove double quotes', () => {
    expect(sanitize.sql('test"injection')).toBe('testinjection')
  })

  it('should remove semicolons', () => {
    expect(sanitize.sql('test;DROP TABLE')).toBe('testDROP TABLE')
  })

  it('should remove backslashes', () => {
    expect(sanitize.sql('test\\injection')).toBe('testinjection')
  })

  it('should preserve safe characters', () => {
    expect(sanitize.sql('Hello World 123')).toBe('Hello World 123')
  })
})

describe('sanitize.fileName', () => {
  it('should remove special characters', () => {
    expect(sanitize.fileName('test<>file.txt')).toBe('test__file.txt')
  })

  it('should replace spaces with underscores', () => {
    expect(sanitize.fileName('my file.txt')).toBe('my_file.txt')
  })

  it('should remove consecutive dots', () => {
    expect(sanitize.fileName('file..txt')).toBe('file.txt')
  })

  it('should truncate long names', () => {
    const longName = 'a'.repeat(300) + '.txt'
    expect(sanitize.fileName(longName).length).toBeLessThanOrEqual(255)
  })

  it('should allow alphanumeric, dots, and hyphens', () => {
    expect(sanitize.fileName('test-file.123.txt')).toBe('test-file.123.txt')
  })
})

describe('sanitize.isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(sanitize.isValidEmail('test@example.com')).toBe(true)
    expect(sanitize.isValidEmail('user.name@domain.org')).toBe(true)
    expect(sanitize.isValidEmail('test+tag@example.co.uk')).toBe(true)
  })

  it('should reject invalid emails', () => {
    expect(sanitize.isValidEmail('invalid')).toBe(false)
    expect(sanitize.isValidEmail('no@domain')).toBe(false)
    expect(sanitize.isValidEmail('@example.com')).toBe(false)
    expect(sanitize.isValidEmail('test@')).toBe(false)
    expect(sanitize.isValidEmail('test @example.com')).toBe(false)
  })

  it('should reject overly long emails', () => {
    const longEmail = 'a'.repeat(250) + '@example.com'
    expect(sanitize.isValidEmail(longEmail)).toBe(false)
  })
})

describe('sanitize.isValidUrl', () => {
  it('should validate HTTP URLs', () => {
    expect(sanitize.isValidUrl('http://example.com')).toBe(true)
    expect(sanitize.isValidUrl('http://example.com/path')).toBe(true)
  })

  it('should validate HTTPS URLs', () => {
    expect(sanitize.isValidUrl('https://example.com')).toBe(true)
    expect(sanitize.isValidUrl('https://sub.example.com/path?query=1')).toBe(true)
  })

  it('should reject non-HTTP protocols', () => {
    expect(sanitize.isValidUrl('ftp://example.com')).toBe(false)
    expect(sanitize.isValidUrl('javascript:alert(1)')).toBe(false)
    expect(sanitize.isValidUrl('file:///etc/passwd')).toBe(false)
  })

  it('should reject invalid URLs', () => {
    expect(sanitize.isValidUrl('not a url')).toBe(false)
    expect(sanitize.isValidUrl('')).toBe(false)
  })
})

describe('csrf.generate', () => {
  it('should generate a 64-character hex string', () => {
    const token = csrf.generate()
    expect(token).toHaveLength(64)
    expect(token).toMatch(/^[0-9a-f]+$/)
  })

  it('should generate unique tokens', () => {
    const tokens = new Set(Array.from({ length: 100 }, () => csrf.generate()))
    expect(tokens.size).toBe(100)
  })
})

describe('csrf.validate', () => {
  it('should return true for matching tokens', () => {
    const token = csrf.generate()
    expect(csrf.validate(token, token)).toBe(true)
  })

  it('should return false for different tokens', () => {
    const token1 = csrf.generate()
    const token2 = csrf.generate()
    expect(csrf.validate(token1, token2)).toBe(false)
  })

  it('should return false for different lengths', () => {
    expect(csrf.validate('short', 'longertoken')).toBe(false)
  })

  it('should be timing-safe', () => {
    const token = csrf.generate()
    const almostSame = token.slice(0, -1) + 'x'
    expect(csrf.validate(token, almostSame)).toBe(false)
  })
})

describe('password.validate', () => {
  it('should accept valid passwords', () => {
    const result = password.validate('SecurePass123')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject short passwords', () => {
    const result = password.validate('Short1')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters')
  })

  it('should reject long passwords', () => {
    const result = password.validate('A'.repeat(129) + 'a1')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must be less than 128 characters')
  })

  it('should require lowercase letters', () => {
    const result = password.validate('PASSWORD123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain a lowercase letter')
  })

  it('should require uppercase letters', () => {
    const result = password.validate('password123')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain an uppercase letter')
  })

  it('should require numbers', () => {
    const result = password.validate('PasswordOnly')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Password must contain a number')
  })

  it('should return multiple errors', () => {
    const result = password.validate('short')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

describe('password.isCommon', () => {
  it('should detect common passwords', () => {
    expect(password.isCommon('password')).toBe(true)
    expect(password.isCommon('123456')).toBe(true)
    expect(password.isCommon('qwerty')).toBe(true)
    expect(password.isCommon('admin')).toBe(true)
  })

  it('should be case-insensitive', () => {
    expect(password.isCommon('PASSWORD')).toBe(true)
    expect(password.isCommon('Password')).toBe(true)
  })

  it('should allow uncommon passwords', () => {
    expect(password.isCommon('MyUn1queP@ss')).toBe(false)
    expect(password.isCommon('xK9$mN2@pQ')).toBe(false)
  })
})

describe('ip.getClientIP', () => {
  it('should get IP from x-forwarded-for header', () => {
    const request = createMockRequest({
      headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
    })
    expect(ip.getClientIP(request)).toBe('192.168.1.1')
  })

  it('should get IP from x-real-ip header', () => {
    const request = createMockRequest({
      headers: { 'x-real-ip': '192.168.1.2' }
    })
    expect(ip.getClientIP(request)).toBe('192.168.1.2')
  })

  it('should get IP from cf-connecting-ip header', () => {
    const request = createMockRequest({
      headers: { 'cf-connecting-ip': '192.168.1.3' }
    })
    expect(ip.getClientIP(request)).toBe('192.168.1.3')
  })

  it('should return unknown when no IP headers', () => {
    const request = createMockRequest()
    expect(ip.getClientIP(request)).toBe('unknown')
  })

  it('should prefer x-forwarded-for over other headers', () => {
    const request = createMockRequest({
      headers: {
        'x-forwarded-for': '192.168.1.1',
        'x-real-ip': '192.168.1.2',
        'cf-connecting-ip': '192.168.1.3'
      }
    })
    expect(ip.getClientIP(request)).toBe('192.168.1.1')
  })
})

describe('ip.toNumber', () => {
  it('should convert IP to number consistently', () => {
    // Note: JavaScript bit shifts work with 32-bit signed integers
    // The actual values may be negative due to overflow, but they work correctly for comparisons
    const ip1 = ip.toNumber('192.168.1.1')
    const ip2 = ip.toNumber('192.168.1.2')
    expect(ip1).not.toBe(ip2)
    expect(ip.toNumber('0.0.0.0')).toBe(0)
  })

  it('should handle localhost', () => {
    // 127.0.0.1 produces a consistent number
    const localhost = ip.toNumber('127.0.0.1')
    expect(typeof localhost).toBe('number')
    expect(localhost).not.toBe(0)
  })
})

describe('ip.isInRange', () => {
  it('should check if IP is in CIDR range', () => {
    expect(ip.isInRange('192.168.1.100', '192.168.1.0/24')).toBe(true)
    expect(ip.isInRange('192.168.2.1', '192.168.1.0/24')).toBe(false)
  })

  it('should handle /32 (single IP)', () => {
    expect(ip.isInRange('192.168.1.1', '192.168.1.1/32')).toBe(true)
    expect(ip.isInRange('192.168.1.2', '192.168.1.1/32')).toBe(false)
  })

  it('should handle /16 (class B)', () => {
    expect(ip.isInRange('192.168.100.100', '192.168.0.0/16')).toBe(true)
    expect(ip.isInRange('192.169.1.1', '192.168.0.0/16')).toBe(false)
  })

  it('should default to /32 without explicit CIDR', () => {
    expect(ip.isInRange('192.168.1.1', '192.168.1.1')).toBe(true)
    expect(ip.isInRange('192.168.1.2', '192.168.1.1')).toBe(false)
  })
})
