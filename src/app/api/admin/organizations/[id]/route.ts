/**
 * Admin Organization API Route
 * Update and delete organization
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { admin } from '@/lib/admin';
import { z } from 'zod';

const updateOrgSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/).optional(),
  plan: z.enum(['FREE', 'STARTER', 'PRO', 'ENTERPRISE']).optional(),
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

// PATCH /api/admin/organizations/[id] - Update organization
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = updateOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const organization = await admin.updateOrganization(id, parsed.data);

    return NextResponse.json({ organization });
  } catch (error) {
    console.error('Update organization error:', error);

    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/organizations/[id] - Delete organization
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin();
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;

    await admin.deleteOrganization(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
