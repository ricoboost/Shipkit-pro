/**
 * 2FA Authenticate API Route
 * Verifies 2FA code during login process
 */

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyTOTP,
  decryptSecret,
  verifyBackupCode,
  removeBackupCode,
} from '@/lib/auth/totp'
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per hour (strict for 2FA brute force protection)
    const { allowed, headers } = await withRateLimit(request, rateLimitPresets.authStrict)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please try again later.' },
        { status: 429, headers }
      )
    }

    const { email, code, isBackupCode } = await request.json()

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // Strict validation: TOTP codes must be exactly 6 numeric digits
    if (!isBackupCode && (typeof code !== 'string' || !/^\d{6}$/.test(code))) {
      return NextResponse.json(
        { error: 'Invalid verification code format' },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorBackupCodes: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      )
    }

    let isValid = false

    // Get IP for audit logging
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    if (isBackupCode) {
      // Verify backup code
      isValid = verifyBackupCode(code, user.twoFactorBackupCodes)

      // SECURITY: Log all backup code attempts (success and failure)
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: isValid ? '2fa.backup_code.success' : '2fa.backup_code.failure',
          resource: 'user',
          resourceId: user.id,
          ipAddress,
          userAgent,
          metadata: {
            remainingCodes: user.twoFactorBackupCodes.length - (isValid ? 1 : 0),
          },
        },
      })

      if (isValid) {
        // Remove used backup code
        const updatedCodes = removeBackupCode(code, user.twoFactorBackupCodes)
        await db.user.update({
          where: { id: user.id },
          data: { twoFactorBackupCodes: updatedCodes },
        })
      }
    } else {
      // Verify TOTP code
      const secret = decryptSecret(user.twoFactorSecret)
      isValid = verifyTOTP(code, secret)
    }

    if (!isValid) {
      return NextResponse.json(
        { error: isBackupCode ? 'Invalid backup code' : 'Invalid verification code' },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('2FA authenticate error:', error)
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    )
  }
}
