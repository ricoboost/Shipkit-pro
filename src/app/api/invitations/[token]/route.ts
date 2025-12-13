/**
 * Invitation Token API Route
 * Get, accept, or decline invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { invitations } from '@/lib/organizations';

interface RouteParams {
  params: Promise<{ token: string }>;
}

// SECURITY: Validate token format (64-character hex string)
function isValidToken(token: string): boolean {
  return typeof token === 'string' && /^[a-f0-9]{64}$/i.test(token);
}

// GET /api/invitations/[token] - Get invitation details
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params;

    // SECURITY: Validate token format before database query
    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const invitation = await invitations.getByToken(token);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    if (invitation.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        organization: invitation.organization,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    console.error('Get invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}

// POST /api/invitations/[token] - Accept invitation
export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;

    // SECURITY: Validate token format before database query
    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    await invitations.accept(token, session.user.id);

    return NextResponse.json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error('Accept invitation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to accept invitation' },
      { status: 500 }
    );
  }
}

// DELETE /api/invitations/[token] - Decline invitation
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { token } = await params;

    // SECURITY: Validate token format before database query
    if (!isValidToken(token)) {
      return NextResponse.json({ error: 'Invalid token format' }, { status: 400 });
    }

    const invitation = await invitations.getByToken(token);

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Verify user's email matches invitation (null check prevents bypass)
    if (!session.user.email || session.user.email !== invitation.email) {
      return NextResponse.json({ error: 'Not your invitation' }, { status: 403 });
    }

    await invitations.delete(invitation.id);

    return NextResponse.json({ success: true, message: 'Invitation declined' });
  } catch (error) {
    console.error('Decline invitation error:', error);
    return NextResponse.json(
      { error: 'Failed to decline invitation' },
      { status: 500 }
    );
  }
}
