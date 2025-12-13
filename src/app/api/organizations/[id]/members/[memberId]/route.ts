/**
 * Single Organization Member API Route
 * Update role or remove member
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { organizations } from '@/lib/organizations';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

interface RouteParams {
  params: Promise<{ id: string; memberId: string }>;
}

// PATCH /api/organizations/[id]/members/[memberId] - Update member role
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, memberId } = await params;

    // Check permissions (owner or admin)
    const canManage = await organizations.canManage(id, session.user.id);
    if (!canManage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const member = await organizations.updateMemberRole(id, memberId, parsed.data.role);

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[id]/members/[memberId] - Remove member
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, memberId } = await params;

    // Check if removing self
    if (memberId === session.user.id) {
      // Users can remove themselves (leave organization)
      const role = await organizations.getMemberRole(id, session.user.id);
      if (role === 'OWNER') {
        return NextResponse.json(
          { error: 'Owner cannot leave. Transfer ownership first.' },
          { status: 400 }
        );
      }
    } else {
      // Need admin/owner permission to remove others
      const canManage = await organizations.canManage(id, session.user.id);
      if (!canManage) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }
    }

    await organizations.removeMember(id, memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove member' },
      { status: 500 }
    );
  }
}
