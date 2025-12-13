/**
 * Credits Balance API Route
 * Get user's current credit balance
 *
 * SECURITY: Rate limited to prevent abuse
 */

import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { credits } from '@/lib/payments';
import { withRateLimit } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest): Promise<Response> {
  try {
    // Rate limit: 60 requests per minute
    const { allowed, headers } = await withRateLimit(req, {
      windowMs: 60 * 1000,
      maxRequests: 60,
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

    const balance = await credits.getBalance(session.user.id);

    return Response.json({ balance });
  } catch (error) {
    console.error('Credits balance error:', error);
    return Response.json(
      { error: 'Failed to get balance' },
      { status: 500 }
    );
  }
}
