/**
 * Security Library
 * Centralized security utilities
 */

export * from './rate-limit';
export * from './headers';

import { db } from '@/lib/db';

/**
 * API Key validation utilities
 * SECURITY: Always checks expiration before allowing access
 */
export const apiKeys = {
  /**
   * Validate an API key and check expiration
   * Returns user ID if valid, null if invalid/expired
   */
  async validate(key: string): Promise<{
    userId: string;
    keyId: string;
  } | null> {
    if (!key || !key.startsWith('sk_live_')) {
      return null;
    }

    const apiKey = await db.apiKey.findUnique({
      where: { key },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
      },
    });

    if (!apiKey) {
      return null;
    }

    // SECURITY: Check expiration
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      console.warn(`API key ${apiKey.id} has expired`);
      return null;
    }

    // Update lastUsed timestamp (background task with error logging)
    db.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() },
    }).catch((error) => {
      // SECURITY: Log errors instead of silently ignoring
      // This helps detect database issues that could affect API key tracking
      console.error('Failed to update API key lastUsed:', error);
    });

    return {
      userId: apiKey.userId,
      keyId: apiKey.id,
    };
  },

  /**
   * Extract API key from request headers
   */
  fromRequest(request: Request): string | null {
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return request.headers.get('X-API-Key');
  },
};

/**
 * Production-safe error handling
 * SECURITY: Prevents verbose error messages in production
 */
export const errors = {
  /**
   * Get a safe error message for API responses
   * In production, returns generic messages to prevent info disclosure
   */
  safe(error: unknown, genericMessage: string = 'An error occurred'): string {
    if (process.env.NODE_ENV !== 'production') {
      // In development, return actual error message
      return error instanceof Error ? error.message : genericMessage;
    }

    // In production, only return generic messages
    // Log the actual error server-side for debugging
    if (error instanceof Error) {
      console.error('[Error]', error.message, error.stack);
    }

    return genericMessage;
  },

  /**
   * Create a safe error response for API routes
   */
  response(
    error: unknown,
    genericMessage: string = 'An error occurred',
    status: number = 500
  ): Response {
    return Response.json(
      { error: errors.safe(error, genericMessage) },
      { status }
    );
  },

  /**
   * Check if error is a known/expected error type
   */
  isExpected(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const expectedPatterns = [
      'Unauthorized',
      'Forbidden',
      'Not found',
      'Invalid',
      'already exists',
      'Insufficient credits',
    ];

    return expectedPatterns.some((p) =>
      error.message.toLowerCase().includes(p.toLowerCase())
    );
  },
};

/**
 * PII redaction for logging
 */
export const logging = {
  /**
   * Redact sensitive fields from an object for safe logging
   */
  redact(
    obj: Record<string, unknown>,
    sensitiveFields: string[] = ['password', 'token', 'secret', 'apiKey', 'key', 'creditCard', 'ssn']
  ): Record<string, unknown> {
    const result = { ...obj };

    for (const field of sensitiveFields) {
      if (field in result) {
        result[field] = '[REDACTED]';
      }
    }

    // Also redact email partially
    if ('email' in result && typeof result.email === 'string') {
      const email = result.email;
      const [local, domain] = email.split('@');
      result.email = `${local.substring(0, 2)}***@${domain}`;
    }

    return result;
  },

  /**
   * Create a safe log message
   */
  safe(message: string, data?: Record<string, unknown>): string {
    if (!data) return message;
    return `${message} ${JSON.stringify(logging.redact(data))}`;
  },
};

/**
 * Privacy/PII protection utilities
 */
export const privacy = {
  /**
   * Mask an email address for display
   * e.g., "john.doe@example.com" -> "jo***@example.com"
   */
  maskEmail(email: string): string {
    if (!email || !email.includes('@')) return '***@***.***';

    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2
      ? localPart.substring(0, 2) + '***'
      : '***';

    const domainParts = domain.split('.');
    const maskedDomain = domainParts.length > 1
      ? domainParts[0].substring(0, 2) + '***.' + domainParts.slice(-1)[0]
      : '***.' + domain;

    return `${maskedLocal}@${maskedDomain}`;
  },

  /**
   * Mask a name for display
   * e.g., "John Doe" -> "J*** D***"
   */
  maskName(name: string): string {
    if (!name) return '***';

    return name
      .split(' ')
      .map((part) => (part.length > 0 ? part[0] + '***' : '***'))
      .join(' ');
  },

  /**
   * Mask sensitive ID (show only last 4 chars)
   * e.g., "cus_abc123xyz789" -> "***789"
   */
  maskId(id: string): string {
    if (!id || id.length < 4) return '***';
    return '***' + id.slice(-4);
  },

  /**
   * Anonymize user object for admin views that don't need full PII
   */
  anonymizeUser<T extends { email?: string; name?: string | null }>(
    user: T,
    fields: ('email' | 'name')[] = ['email']
  ): T {
    const result = { ...user };

    if (fields.includes('email') && result.email) {
      result.email = privacy.maskEmail(result.email);
    }
    if (fields.includes('name') && result.name) {
      result.name = privacy.maskName(result.name);
    }

    return result;
  },

  /**
   * Anonymize array of users
   */
  anonymizeUsers<T extends { email?: string; name?: string | null }>(
    users: T[],
    fields: ('email' | 'name')[] = ['email']
  ): T[] {
    return users.map((user) => privacy.anonymizeUser(user, fields));
  },

  /**
   * Check if admin has consent to view full PII
   * This could be implemented with explicit consent tracking
   */
  async hasConsentToViewPII(adminId: string, userId: string): Promise<boolean> {
    // For now, always require anonymization unless actively impersonating
    // or viewing own data
    return adminId === userId;
  },
};

/**
 * Input sanitization helpers
 */
export const sanitize = {
  /**
   * Escape HTML to prevent XSS
   */
  html(input: string): string {
    const escapeMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return input.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
  },

  /**
   * Remove HTML tags
   */
  stripTags(input: string): string {
    return input.replace(/<[^>]*>/g, '');
  },

  /**
   * Sanitize for SQL (use parameterized queries instead when possible)
   */
  sql(input: string): string {
    return input.replace(/['";\\]/g, '');
  },

  /**
   * Sanitize file names
   */
  fileName(input: string): string {
    return input
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .substring(0, 255);
  },

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  /**
   * Validate URL
   */
  isValidUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
      return false;
    }
  },
};

/**
 * CSRF token generation and validation
 */
export const csrf = {
  /**
   * Generate a CSRF token
   */
  generate(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  },

  /**
   * Validate CSRF token with timing-safe comparison
   * SECURITY: Fixed timing side-channel by always comparing full length
   */
  validate(token: string, expected: string): boolean {
    // SECURITY: Pad shorter string to avoid timing leak from length check
    const maxLen = Math.max(token.length, expected.length, 64);
    const tokenPadded = token.padEnd(maxLen, '\0');
    const expectedPadded = expected.padEnd(maxLen, '\0');

    // Use crypto.timingSafeEqual for constant-time comparison
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const cryptoModule = require('crypto');
      return cryptoModule.timingSafeEqual(
        Buffer.from(tokenPadded),
        Buffer.from(expectedPadded)
      ) && token.length === expected.length;
    } catch {
      // Fallback for edge runtime (still constant-time)
      let result = token.length ^ expected.length;
      for (let i = 0; i < maxLen; i++) {
        result |= tokenPadded.charCodeAt(i) ^ expectedPadded.charCodeAt(i);
      }
      return result === 0;
    }
  },
};

/**
 * Password validation
 */
export const password = {
  /**
   * Validate password strength
   */
  validate(
    pwd: string
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (pwd.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (pwd.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    if (!/[a-z]/.test(pwd)) {
      errors.push('Password must contain a lowercase letter');
    }
    if (!/[A-Z]/.test(pwd)) {
      errors.push('Password must contain an uppercase letter');
    }
    if (!/[0-9]/.test(pwd)) {
      errors.push('Password must contain a number');
    }

    return { valid: errors.length === 0, errors };
  },

  /**
   * Check against common passwords (basic list)
   */
  isCommon(pwd: string): boolean {
    const common = [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
      'password1',
      'letmein',
      'welcome',
      'admin',
      'login',
    ];
    return common.includes(pwd.toLowerCase());
  },

  /**
   * SECURITY: Check if password has been exposed in data breaches
   * Uses haveibeenpwned k-anonymity API (only sends first 5 chars of SHA1)
   * @returns number of times password was found in breaches, or -1 on error
   */
  async checkBreached(pwd: string): Promise<number> {
    try {
      // Hash password with SHA1
      const encoder = new TextEncoder();
      const data = encoder.encode(pwd);
      const hashBuffer = await crypto.subtle.digest('SHA-1', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

      // k-anonymity: only send first 5 characters
      const prefix = hashHex.substring(0, 5);
      const suffix = hashHex.substring(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: {
          'User-Agent': 'ShipKit-Security-Check',
        },
      });

      if (!response.ok) {
        console.error('haveibeenpwned API error:', response.status);
        return -1; // Don't block on API errors
      }

      const text = await response.text();
      const lines = text.split('\n');

      for (const line of lines) {
        const [hashSuffix, count] = line.split(':');
        if (hashSuffix.trim() === suffix) {
          return parseInt(count.trim(), 10);
        }
      }

      return 0; // Not found in breaches
    } catch (error) {
      console.error('Password breach check error:', error);
      return -1; // Don't block on errors
    }
  },
};

/**
 * SECURITY: Field-level encryption for sensitive database values
 * Uses AES-256-GCM with random IVs
 */
export const encryption = {
  /**
   * Encrypt a string value
   */
  encrypt(value: string, key?: string): string {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoModule = require('crypto');
    const encryptionKey = key || process.env.FIELD_ENCRYPTION_KEY;

    if (!encryptionKey) {
      // In development, warn but don't block
      if (process.env.NODE_ENV !== 'production') {
        console.warn('FIELD_ENCRYPTION_KEY not set, storing value without encryption');
        return `plain:${value}`;
      }
      throw new Error('FIELD_ENCRYPTION_KEY is required in production');
    }

    // Derive a 32-byte key from the provided key
    const derivedKey = cryptoModule.createHash('sha256').update(encryptionKey).digest();
    const iv = cryptoModule.randomBytes(12);
    const cipher = cryptoModule.createCipheriv('aes-256-gcm', derivedKey, iv);

    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    // Format: enc:iv:authTag:ciphertext
    return `enc:${iv.toString('hex')}:${authTag}:${encrypted}`;
  },

  /**
   * Decrypt a string value
   */
  decrypt(encryptedValue: string, key?: string): string {
    // Handle plaintext values (development mode)
    if (encryptedValue.startsWith('plain:')) {
      return encryptedValue.substring(6);
    }

    // Handle unencrypted legacy values
    if (!encryptedValue.startsWith('enc:')) {
      return encryptedValue;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const cryptoModule = require('crypto');
    const encryptionKey = key || process.env.FIELD_ENCRYPTION_KEY;

    if (!encryptionKey) {
      throw new Error('FIELD_ENCRYPTION_KEY is required for decryption');
    }

    const [, ivHex, authTagHex, ciphertext] = encryptedValue.split(':');
    const derivedKey = cryptoModule.createHash('sha256').update(encryptionKey).digest();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = cryptoModule.createDecipheriv('aes-256-gcm', derivedKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  },

  /**
   * Check if a value is encrypted
   */
  isEncrypted(value: string): boolean {
    return value.startsWith('enc:') || value.startsWith('plain:');
  },
};

/**
 * SECURITY: Admin verification utilities
 * Verifies admin role from database, not just session
 */
export const adminVerify = {
  /**
   * Verify that a user is an admin by checking the database
   * Use for critical operations where session data might be stale
   */
  async verifyAdminRole(userId: string): Promise<boolean> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    // Must be an active admin
    return user?.role === 'ADMIN' && user?.status === 'ACTIVE';
  },

  /**
   * Verify admin and get user data atomically
   * Returns user data if valid admin, null otherwise
   */
  async requireAdmin(userId: string): Promise<{
    id: string;
    email: string;
    role: 'ADMIN';
  } | null> {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true, status: true },
    });

    if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      role: 'ADMIN' as const,
    };
  },

  /**
   * SECURITY: Critical admin action verification
   * For destructive operations like user deletion, ownership transfer, etc.
   * Logs the action and double-checks permissions
   */
  async verifyCriticalAction(
    adminUserId: string,
    action: string,
    targetResource: string,
    targetId: string
  ): Promise<{
    allowed: boolean;
    admin?: { id: string; email: string };
    reason?: string;
  }> {
    const admin = await this.requireAdmin(adminUserId);

    if (!admin) {
      return { allowed: false, reason: 'Not an active admin' };
    }

    // Log the critical action attempt
    console.log(`[CRITICAL] Admin ${admin.email} attempting ${action} on ${targetResource}:${targetId}`);

    // Additional checks for specific critical actions
    if (action === 'delete_user' && targetId === adminUserId) {
      return { allowed: false, admin, reason: 'Cannot delete yourself' };
    }

    if (action === 'demote_admin') {
      // Check if this would leave no admins
      const adminCount = await db.user.count({
        where: { role: 'ADMIN', status: 'ACTIVE' },
      });
      if (adminCount <= 1) {
        return { allowed: false, admin, reason: 'Cannot remove the last admin' };
      }
    }

    return { allowed: true, admin };
  },
};

/**
 * IP address utilities
 */
export const ip = {
  /**
   * Get client IP from request headers
   */
  getClientIP(request: Request): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      request.headers.get('cf-connecting-ip') ||
      'unknown'
    );
  },

  /**
   * Check if IP is in CIDR range
   */
  isInRange(ipAddress: string, cidr: string): boolean {
    const [range, bits = '32'] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);

    const ipNum = ip.toNumber(ipAddress);
    const rangeNum = ip.toNumber(range);

    return (ipNum & mask) === (rangeNum & mask);
  },

  /**
   * Convert IP to number
   */
  toNumber(ipAddress: string): number {
    const parts = ipAddress.split('.').map(Number);
    return (
      (parts[0] << 24) +
      (parts[1] << 16) +
      (parts[2] << 8) +
      parts[3]
    );
  },
};
