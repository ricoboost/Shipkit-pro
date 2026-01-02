/**
 * User Impersonation System
 * Allows admins to sign in as other users for debugging/support
 *
 * SECURITY: Cookie is now signed with HMAC to prevent tampering
 */

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import crypto from 'crypto';

const IMPERSONATION_COOKIE = 'shipkit-impersonation';
const SIGNATURE_COOKIE = 'shipkit-impersonation-sig';
// SECURITY: Maximum impersonation session duration (1 hour)
const MAX_IMPERSONATION_DURATION_MS = 60 * 60 * 1000;

interface ImpersonationState {
  adminId: string;
  adminEmail: string;
  adminName?: string;
  targetUserId: string;
  logId: string;
  startedAt: string;
}

/**
 * SECURITY: Sign data with HMAC-SHA256
 */
function signData(data: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error('AUTH_SECRET is required for secure impersonation');
  }
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

/**
 * SECURITY: Verify HMAC signature (timing-safe)
 */
function verifySignature(data: string, signature: string): boolean {
  const expected = signData(data);
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

/**
 * Start impersonating a user
 */
export async function startImpersonation(
  adminId: string,
  targetUserId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  // Get admin user
  const admin = await db.user.findUnique({
    where: { id: adminId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!admin || admin.role !== 'ADMIN') {
    return { success: false, error: 'Only admins can impersonate users' };
  }

  // Get target user
  const targetUser = await db.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });

  if (!targetUser) {
    return { success: false, error: 'Target user not found' };
  }

  // Can't impersonate other admins (security)
  if (targetUser.role === 'ADMIN') {
    return { success: false, error: 'Cannot impersonate admin users' };
  }

  // Create impersonation log
  const log = await db.impersonationLog.create({
    data: {
      adminId,
      userId: targetUserId,
      reason,
    },
  });

  // Set impersonation cookie with HMAC signature
  const state: ImpersonationState = {
    adminId: admin.id,
    adminEmail: admin.email,
    adminName: admin.name || undefined,
    targetUserId,
    logId: log.id,
    startedAt: new Date().toISOString(),
  };

  const stateJson = JSON.stringify(state);
  const signature = signData(stateJson);

  const cookieStore = await cookies();

  // Set state cookie
  cookieStore.set(IMPERSONATION_COOKIE, stateJson, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour max impersonation session
  });

  // Set signature cookie
  cookieStore.set(SIGNATURE_COOKIE, signature, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60,
  });

  return { success: true };
}

/**
 * Stop impersonating a user
 */
export async function stopImpersonation(): Promise<{ success: boolean }> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(IMPERSONATION_COOKIE);

  if (cookie) {
    try {
      const state: ImpersonationState = JSON.parse(cookie.value);

      // Update impersonation log
      await db.impersonationLog.update({
        where: { id: state.logId },
        data: { endedAt: new Date() },
      });
    } catch {
      // Cookie was invalid, just delete it
    }

    // Clear both cookies
    cookieStore.delete(IMPERSONATION_COOKIE);
    cookieStore.delete(SIGNATURE_COOKIE);
  }

  return { success: true };
}

/**
 * Get current impersonation state from cookies
 * SECURITY: Verifies HMAC signature before returning state
 */
export async function getImpersonationState(): Promise<ImpersonationState | null> {
  const cookieStore = await cookies();
  const stateCookie = cookieStore.get(IMPERSONATION_COOKIE);
  const sigCookie = cookieStore.get(SIGNATURE_COOKIE);

  if (!stateCookie || !sigCookie) {
    return null;
  }

  try {
    // SECURITY: Verify signature before parsing
    if (!verifySignature(stateCookie.value, sigCookie.value)) {
      console.warn('SECURITY: Invalid impersonation cookie signature detected');
      // Clear tampered cookies
      cookieStore.delete(IMPERSONATION_COOKIE);
      cookieStore.delete(SIGNATURE_COOKIE);
      return null;
    }

    const state = JSON.parse(stateCookie.value) as ImpersonationState;

    // SECURITY: Check if impersonation session has expired (1 hour max)
    const startedAt = new Date(state.startedAt).getTime();
    const now = Date.now();
    if (now - startedAt > MAX_IMPERSONATION_DURATION_MS) {
      console.warn('SECURITY: Impersonation session expired');
      // Clear expired cookies
      cookieStore.delete(IMPERSONATION_COOKIE);
      cookieStore.delete(SIGNATURE_COOKIE);
      // Update log to mark as expired
      try {
        await db.impersonationLog.update({
          where: { id: state.logId },
          data: { endedAt: new Date() },
        });
      } catch {
        // Log update failed, but session is still expired
      }
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

/**
 * Check if currently impersonating
 */
export async function isImpersonating(): Promise<boolean> {
  const state = await getImpersonationState();
  return state !== null;
}

/**
 * Get the impersonated user data for the session
 */
export async function getImpersonatedUser(state: ImpersonationState) {
  return db.user.findUnique({
    where: { id: state.targetUserId },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
    },
  });
}
