/**
 * User Invitations API Route
 * List pending invitations for current user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invitations } from '@/lib/organizations';

// GET /api/invitations - List user's pending invitations
export async function GET() {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingInvitations = await invitations.getUserInvitations(session.user.email);

    return NextResponse.json({ invitations: pendingInvitations });
  } catch (error) {
    console.error('Get user invitations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
