/**
 * Admin Organization Members API Route
 * Add and manage organization members
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { db } from '@/lib/db';
import { z } from 'zod';

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']),
});

interface RouteParams {
  params: Promise<{ id: string }>;
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

// POST /api/admin/organizations/[id]/members - Add member
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = addMemberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found with that email' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await db.organizationMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: id,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a member of this organization' },
        { status: 400 }
      );
    }

    const member = await admin.addOrganizationMember(id, user.id, parsed.data.role);

    return NextResponse.json({ member });
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to add member' },
      { status: 500 }
    );
  }
}
