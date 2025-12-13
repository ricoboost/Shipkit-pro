/**
 * Admin Suspend User API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { z } from 'zod';

const suspendUserSchema = z.object({
  reason: z.string().max(500).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/users/[id]/suspend - Suspend user
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent admin from suspending themselves
    if (id === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot suspend your own account' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = suspendUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = await admin.suspendUser(id, parsed.data.reason);

    return NextResponse.json({ user, message: 'User suspended successfully' });
  } catch (error) {
    console.error('Suspend user error:', error);
    return NextResponse.json(
      { error: 'Failed to suspend user' },
      { status: 500 }
    );
  }
}
