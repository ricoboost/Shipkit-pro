/**
 * Admin User API Route
 * Update and delete user
 *
 * SECURITY:
 * - Verifies admin role from database for critical operations
 * - Prevents self-deletion and last-admin removal
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { adminVerify } from '@/lib/security';
import { z } from 'zod';

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper to check admin access (session-based for non-critical ops)
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

// PATCH /api/admin/users/[id] - Update user
// SECURITY: Uses database verification for consistency with DELETE
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    // First check session
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // SECURITY: Verify admin role from database for this operation
    const verification = await adminVerify.verifyCriticalAction(
      session.user.id,
      'update_user',
      'user',
      id
    );

    if (!verification.allowed) {
      return NextResponse.json(
        { error: verification.reason || 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const user = await admin.updateUser(id, parsed.data);

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id] - Delete user
// SECURITY: Uses database verification for this critical operation
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    // First check session
    const session = await auth.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // SECURITY: Verify admin role from database for this critical operation
    const verification = await adminVerify.verifyCriticalAction(
      session.user.id,
      'delete_user',
      'user',
      id
    );

    if (!verification.allowed) {
      return NextResponse.json(
        { error: verification.reason || 'Action not allowed' },
        { status: 403 }
      );
    }

    await admin.deleteUser(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
