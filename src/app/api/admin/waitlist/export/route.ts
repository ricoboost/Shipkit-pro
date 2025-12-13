/**
 * Waitlist Export API Route
 * GET /api/admin/waitlist/export
 *
 * SECURITY:
 * - Limited to 100,000 records max to prevent DoS
 * - Rate limited
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { withRateLimit } from '@/lib/security/rate-limit';

// SECURITY: Maximum records to export to prevent DoS/memory exhaustion
const MAX_EXPORT_RECORDS = 100000;

async function requireAdmin() {
  const session = await auth.getSession();
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }
  if (session.user.role !== 'ADMIN') {
    return { error: 'Admin access required', status: 403 };
  }
  return { session };
}

export async function GET(req: NextRequest) {
  try {
    // Rate limit: 10 exports per hour
    const { allowed, headers } = await withRateLimit(req, {
      windowMs: 60 * 60 * 1000,
      maxRequests: 10,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many export requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const confirmedOnly = searchParams.get('confirmedOnly') === 'true';
    const tag = searchParams.get('tag') || undefined;

    // SECURITY: Pass max limit to prevent unbounded exports
    const csv = await admin.exportWaitlistCSV({
      confirmedOnly,
      tag,
      maxRecords: MAX_EXPORT_RECORDS,
    });

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="waitlist-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export waitlist error:', error);
    return NextResponse.json({ error: 'Failed to export waitlist' }, { status: 500 });
  }
}
