/**
 * Organization Invitations API Route
 * List and cancel invitations
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { organizations, invitations } from '@/lib/organizations';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/organizations/[id]/invitations - List pending invitations
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check permissions
    const canManage = await organizations.canManage(id, session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const pendingInvitations = await invitations.getOrganizationInvitations(id);

    return NextResponse.json({ invitations: pendingInvitations });
  } catch (error) {
    console.error('Get invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
