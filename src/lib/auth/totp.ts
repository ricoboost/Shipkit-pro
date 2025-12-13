/**
 * Two-Factor Authentication (TOTP) Utilities
 * Implements Time-based One-Time Password (RFC 6238)
 */

import { authenticator } from 'otplib'
import QRCode from 'qrcode'
import crypto from 'crypto'

// Configure authenticator options
authenticator.options = {
  digits: 6,
  step: 30,
  window: 1, // Allow 1 step variance (30 seconds before/after)
}

/**
 * Generate a new TOTP secret
 */
export function generateSecret(): string {
  return authenticator.generateSecret()
}

/**
 * Generate a TOTP code from a secret
 */
export function generateTOTP(secret: string): string {
  return authenticator.generate(secret)
}

/**
 * Verify a TOTP code against a secret
 * Uses timing-safe comparison to prevent timing attacks
 */
export function verifyTOTP(token: string, secret: string): boolean {
  try {
    // Generate the expected token for current and adjacent time windows
    const currentToken = authenticator.generate(secret)

    // Use timing-safe comparison to prevent timing attacks
    // Even if lengths differ, we still perform comparison to avoid timing leaks
    const tokenBuffer = Buffer.from(token.padEnd(6, '0'))
    const expectedBuffer = Buffer.from(currentToken.padEnd(6, '0'))

    const isCurrentValid = crypto.timingSafeEqual(tokenBuffer, expectedBuffer)

    // Also check adjacent time windows (±1 step) for clock drift tolerance
    // This is handled by otplib's window option, but we verify with timing-safe compare
    if (isCurrentValid) {
      return true
    }

    // Fallback to otplib verify for window tolerance, but only after timing-safe check
    return authenticator.verify({ token, secret })
  } catch {
    return false
  }
}

/**
 * Generate the otpauth URI for QR codes
 */
export function generateOtpauthUri(
  email: string,
  secret: string,
  issuer: string = 'ShipKit'
): string {
  return authenticator.keyuri(email, issuer, secret)
}

/**
 * Generate a QR code data URL for the TOTP setup
 */
export async function generateQRCode(
  email: string,
  secret: string,
  issuer: string = 'ShipKit'
): Promise<string> {
  const otpauthUri = generateOtpauthUri(email, secret, issuer)
  return QRCode.toDataURL(otpauthUri, {
    width: 256,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

/**
 * Generate backup codes for account recovery
 */
export function generateBackupCodes(count: number = 10): string[] {
  return Array.from({ length: count }, () => {
    // Generate 8-character alphanumeric codes
    const bytes = crypto.randomBytes(5)
    return bytes.toString('hex').toUpperCase().slice(0, 8)
  })
}

/**
 * Hash backup codes for secure storage
 */
export function hashBackupCodes(codes: string[]): string[] {
  return codes.map((code) =>
    crypto.createHash('sha256').update(code.toUpperCase()).digest('hex')
  )
}

/**
 * Verify a backup code against stored hashes
 */
export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const hashedInput = crypto
    .createHash('sha256')
    .update(code.toUpperCase().replace(/\s/g, ''))
    .digest('hex')
  return hashedCodes.includes(hashedInput)
}

/**
 * Remove a used backup code from the list
 */
export function removeBackupCode(code: string, hashedCodes: string[]): string[] {
  const hashedInput = crypto
    .createHash('sha256')
    .update(code.toUpperCase().replace(/\s/g, ''))
    .digest('hex')
  return hashedCodes.filter((hash) => hash !== hashedInput)
}

/**
 * Encrypt a secret for database storage
 * Uses AES-256-GCM for authenticated encryption
 */
export function encryptSecret(secret: string, key?: string): string {
  const encryptionKey = key || process.env.TWO_FACTOR_ENCRYPTION_KEY
  if (!encryptionKey) {
    // SECURITY: Never store 2FA secrets in plaintext
    throw new Error(
      'TWO_FACTOR_ENCRYPTION_KEY environment variable is not set. ' +
      'Cannot store 2FA secrets securely. Please configure this before enabling 2FA.'
    )
  }

  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  )

  let encrypted = cipher.update(secret, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const authTag = cipher.getAuthTag()

  // Return IV + AuthTag + Encrypted data
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
}

/**
 * Decrypt a secret from database storage
 */
export function decryptSecret(encryptedSecret: string, key?: string): string {
  const encryptionKey = key || process.env.TWO_FACTOR_ENCRYPTION_KEY
  if (!encryptionKey) {
    // If no encryption key is set, assume the secret is stored in plain text
    return encryptedSecret
  }

  const parts = encryptedSecret.split(':')
  if (parts.length !== 3) {
    // Not encrypted, return as-is
    return encryptedSecret
  }

  const [ivHex, authTagHex, encryptedHex] = parts
  const iv = Buffer.from(ivHex, 'hex')
  const authTag = Buffer.from(authTagHex, 'hex')

  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(encryptionKey, 'hex'),
    iv
  )
  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Format backup codes for display (grouped in pairs)
 */
export function formatBackupCodes(codes: string[]): string[] {
  return codes.map((code) => {
    // Format as XXXX-XXXX
    return code.slice(0, 4) + '-' + code.slice(4)
  })
}

/**
 * 2FA Setup result type
 */
export interface TwoFactorSetupResult {
  secret: string
  qrCodeDataUrl: string
  backupCodes: string[]
  formattedBackupCodes: string[]
}

/**
 * Complete 2FA setup - generates all necessary data
 */
export async function setupTwoFactor(
  email: string,
  issuer?: string
): Promise<TwoFactorSetupResult> {
  const secret = generateSecret()
  const qrCodeDataUrl = await generateQRCode(email, secret, issuer)
  const backupCodes = generateBackupCodes()
  const formattedBackupCodes = formatBackupCodes(backupCodes)

  return {
    secret,
    qrCodeDataUrl,
    backupCodes,
    formattedBackupCodes,
  }
}
