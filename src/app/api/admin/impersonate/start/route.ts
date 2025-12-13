/**
 * Start Impersonation API Route
 * POST /api/admin/impersonate/start
 *
 * SECURITY:
 * - Requires admin role
 * - Prevents admin-to-admin impersonation
 * - Requires reason for audit trail
 * - Rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { startImpersonation } from '@/lib/impersonation';
import { db } from '@/lib/db';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limit';

const startImpersonationSchema = z.object({
  userId: z.string().min(1),
  // SECURITY: Reason is now REQUIRED for audit trail
  reason: z.string().min(10, 'Please provide a reason (min 10 characters)').max(500),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 impersonations per hour
    const { allowed, headers } = await withRateLimit(req, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many impersonation requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Must be admin to impersonate
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if already impersonating
    if (session.impersonation?.isImpersonating) {
      return NextResponse.json(
        { error: 'Already impersonating a user. Stop current impersonation first.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = startImpersonationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Can't impersonate yourself
    if (parsed.data.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot impersonate yourself' },
        { status: 400 }
      );
    }

    // SECURITY: Prevent admin-to-admin impersonation
    const targetUser = await db.user.findUnique({
      where: { id: parsed.data.userId },
      select: { id: true, role: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Cannot impersonate other administrators' },
        { status: 403 }
      );
    }

    const result = await startImpersonation(
      session.user.id,
      parsed.data.userId,
      parsed.data.reason
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Impersonation started. Refresh the page to continue as the user.',
    });
  } catch (error) {
    console.error('Start impersonation error:', error);
    return NextResponse.json(
      { error: 'Failed to start impersonation' },
      { status: 500 }
    );
  }
}
