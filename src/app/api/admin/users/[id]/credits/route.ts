/**
 * Admin Adjust Credits API Route
 *
 * SECURITY:
 * - Full audit logging of all credit adjustments
 * - Rate limited to prevent abuse
 * - Alerts on suspicious large adjustments
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { db } from '@/lib/db';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limit';
import { ip } from '@/lib/security';

// SECURITY: Lower limit for large adjustments that need extra scrutiny
const LARGE_ADJUSTMENT_THRESHOLD = 10000;

const adjustCreditsSchema = z.object({
  amount: z.number().int().refine((val) => val !== 0, {
    message: 'Amount cannot be zero',
  }),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(500),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/users/[id]/credits - Adjust user credits
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    // Rate limit: 20 adjustments per hour per admin
    const { allowed, headers } = await withRateLimit(req, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 20,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many credit adjustments. Please try again later.' },
        { status: 429, headers }
      );
    }

    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id: targetUserId } = await params;
    const body = await req.json();
    const parsed = adjustCreditsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { amount, reason } = parsed.data;

    // Get target user info for audit
    const targetUser = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, creditBalance: { select: { balance: true } } },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const previousBalance = targetUser.creditBalance?.balance || 0;

    // SECURITY: Check for suspicious large adjustments
    const isLargeAdjustment = Math.abs(amount) >= LARGE_ADJUSTMENT_THRESHOLD;

    // Perform the adjustment
    const result = await admin.adjustCredits(targetUserId, amount, reason);

    // SECURITY: Comprehensive audit logging
    const ipAddress = ip.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'unknown';

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: amount > 0 ? 'admin.credits.grant' : 'admin.credits.deduct',
        resource: 'creditBalance',
        resourceId: targetUserId,
        ipAddress,
        userAgent,
        metadata: {
          targetUserId,
          targetEmail: targetUser.email,
          amount,
          previousBalance,
          newBalance: result.balance.balance,
          reason,
          isLargeAdjustment,
          adminId: session.user.id,
          adminEmail: session.user.email,
          ledgerEntryId: result.ledgerEntry.id,
        },
      },
    });

    // SECURITY: Log large adjustments as warnings for monitoring
    if (isLargeAdjustment) {
      console.warn(
        `[SECURITY ALERT] Large credit adjustment: ${amount} credits ` +
        `by admin ${session.user.email} for user ${targetUser.email}. ` +
        `Reason: ${reason}`
      );
    }

    return NextResponse.json({
      ledgerEntry: result.ledgerEntry,
      balance: result.balance.balance,
      message: `Credits ${amount > 0 ? 'added' : 'removed'} successfully`,
    });
  } catch (error) {
    console.error('Adjust credits error:', error);
    return NextResponse.json(
      { error: 'Failed to adjust credits' },
      { status: 500 }
    );
  }
}
