/**
 * Organization Members API Route
 * List and add members
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { organizations, invitations } from '@/lib/organizations';
import { z } from 'zod';

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/organizations/[id]/members - List members
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // SECURITY: Check org exists first to prevent info leakage
    const org = await organizations.getById(id);
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Check membership
    const isMember = await organizations.isMember(id, session.user.id);
    if (!isMember) {
      return NextResponse.json({ error: 'Not a member' }, { status: 403 });
    }

    const members = await organizations.getMembers(id);

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch members' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[id]/members - Invite member
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const body = await req.json();
    const parsed = inviteMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const invitation = await invitations.create({
      organizationId: id,
      email: parsed.data.email,
      role: parsed.data.role,
      invitedByUserId: session.user.id,
    });

    // TODO: Send invitation email

    return NextResponse.json({ invitation }, { status: 201 });
  } catch (error) {
    console.error('Invite member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to invite member' },
      { status: 500 }
    );
  }
}
