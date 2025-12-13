/**
 * Admin Organization Member API Route
 * Update role and remove members
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { db } from '@/lib/db';
import { z } from 'zod';

const updateMemberSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER']),
});

interface RouteParams {
  params: Promise<{ id: string; memberId: string }>;
}

// Helper to check admin access
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

// PATCH /api/admin/organizations/[id]/members/[memberId] - Update member role
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id, memberId } = await params;
    const body = await req.json();
    const parsed = updateMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get member and verify org
    const member = await db.organizationMember.findUnique({
      where: { id: memberId },
      include: { organization: true },
    });

    if (!member || member.organizationId !== id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent changing owner role
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot change owner role. Transfer ownership instead.' },
        { status: 400 }
      );
    }

    const updated = await admin.updateOrganizationMemberRole(memberId, parsed.data.role);

    return NextResponse.json({ member: updated });
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json(
      { error: 'Failed to update member' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/organizations/[id]/members/[memberId] - Remove member
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id, memberId } = await params;

    // Get member and verify org
    const member = await db.organizationMember.findUnique({
      where: { id: memberId },
      include: { organization: true },
    });

    if (!member || member.organizationId !== id) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Prevent removing owner
    if (member.role === 'OWNER') {
      return NextResponse.json(
        { error: 'Cannot remove owner. Transfer ownership first.' },
        { status: 400 }
      );
    }

    await admin.removeOrganizationMember(memberId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}
