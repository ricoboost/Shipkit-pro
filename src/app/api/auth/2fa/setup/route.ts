/**
 * 2FA Setup API Route
 * Initiates two-factor authentication setup for the current user
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { setupTwoFactor, hashBackupCodes, encryptSecret } from '@/lib/auth/totp'

export async function POST() {
  try {
    const session = await auth.getSession()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      )
    }

    // Generate 2FA setup data
    const appName = process.env.NEXT_PUBLIC_APP_NAME || 'ShipKit'
    const setupData = await setupTwoFactor(user.email, appName)

    // Store the encrypted secret and hashed backup codes temporarily
    // They will be saved permanently after verification
    const encryptedSecret = encryptSecret(setupData.secret)
    const hashedBackupCodes = hashBackupCodes(setupData.backupCodes)

    // Store pending 2FA data in user record
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorBackupCodes: hashedBackupCodes,
        // Keep twoFactorEnabled as false until verified
      },
    })

    // SECURITY: Backup codes are returned ONLY during initial setup
    // The frontend MUST display a prominent warning that these are shown ONCE
    // After this response, backup codes are stored hashed and cannot be retrieved
    return NextResponse.json({
      secret: setupData.secret,
      qrCodeDataUrl: setupData.qrCodeDataUrl,
      backupCodes: setupData.backupCodes,
      // Flag to remind frontend this is a one-time display
      _warning: 'Backup codes are shown only once. Prompt user to save them securely.',
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    )
  }
}
