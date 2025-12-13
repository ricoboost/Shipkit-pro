/**
 * Admin Reactivate User API Route
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/users/[id]/reactivate - Reactivate user
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    const user = await admin.reactivateUser(id);

    return NextResponse.json({ user, message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Reactivate user error:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate user' },
      { status: 500 }
    );
  }
}
