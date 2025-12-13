/**
 * Waitlist Bulk Tag API Route
 * POST /api/admin/waitlist/bulk-tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { z } from 'zod';

const bulkTagSchema = z.object({
  subscriberIds: z.array(z.string()).min(1),
  tags: z.array(z.string()).min(1),
});

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

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const parsed = bulkTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const count = await admin.bulkAddTags(parsed.data.subscriberIds, parsed.data.tags);

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error('Bulk tag error:', error);
    return NextResponse.json({ error: 'Failed to add tags' }, { status: 500 });
  }
}
