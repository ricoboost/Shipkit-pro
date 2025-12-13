/**
 * Credits History API Route
 * Get user's credit transaction history
 *
 * SECURITY:
 * - Rate limited
 * - Pagination limits enforced
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { credits } from '@/lib/payments';
import { withRateLimit } from '@/lib/security/rate-limit';
import type { CreditType } from '@prisma/client';

// SECURITY: Maximum pagination values
const MAX_LIMIT = 100;
const MAX_OFFSET = 10000;

export async function GET(req: NextRequest): Promise<Response> {
  try {
    // Rate limit: 30 requests per minute
    const { allowed, headers } = await withRateLimit(req, {
      windowMs: 60 * 1000,
      maxRequests: 30,
    });
    if (!allowed) {
      return Response.json(
        { error: 'Too many requests' },
        { status: 429, headers }
      );
    }

    const session = await auth.getSession();
    if (!session?.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;

    // SECURITY: Enforce pagination limits
    const requestedLimit = parseInt(searchParams.get('limit') || '50', 10);
    const requestedOffset = parseInt(searchParams.get('offset') || '0', 10);
    const limit = Math.min(Math.max(1, requestedLimit), MAX_LIMIT);
    const offset = Math.min(Math.max(0, requestedOffset), MAX_OFFSET);

    const type = searchParams.get('type') as CreditType | null;

    const history = await credits.getHistory(session.user.id, {
      limit,
      offset,
      type: type || undefined,
    });

    return Response.json(history);
  } catch (error) {
    console.error('Credits history error:', error);
    return Response.json(
      { error: 'Failed to get history' },
      { status: 500 }
    );
  }
}
