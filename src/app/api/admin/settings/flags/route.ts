/**
 * Feature Flags API Route
 * Toggle feature flags (waitlistMode, maintenanceMode)
 *
 * When flags are updated, we also set a cookie that the Edge middleware can read
 * since Prisma doesn't work in Edge runtime.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { FEATURE_FLAGS_COOKIE } from '@/lib/feature-flags/edge';

export const dynamic = 'force-dynamic';

// PATCH - Toggle feature flag (admin only)
export async function PATCH(request: Request) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { waitlistMode, maintenanceMode } = body;

    // Validate that at least one flag is provided
    if (waitlistMode === undefined && maintenanceMode === undefined) {
      return NextResponse.json(
        { error: 'No flag provided' },
        { status: 400 }
      );
    }

    // Build update object with only the provided flags
    const updateData: { waitlistMode?: boolean; maintenanceMode?: boolean } = {};
    if (waitlistMode !== undefined) updateData.waitlistMode = waitlistMode;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;

    // Update the config
    const config = await db.appConfig.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData },
    });

    // Create response with cookie for Edge middleware
    const response = NextResponse.json({ success: true, config });

    // Set feature flags cookie (readable by Edge middleware)
    const flagsCookie = JSON.stringify({
      waitlistMode: config.waitlistMode,
      maintenanceMode: config.maintenanceMode,
    });

    response.cookies.set(FEATURE_FLAGS_COOKIE, flagsCookie, {
      httpOnly: false, // Needs to be readable by client for sync
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error toggling feature flag:', error);
    return NextResponse.json(
      { error: 'Failed to update feature flag' },
      { status: 500 }
    );
  }
}

// GET - Get current feature flags (also sets cookie for middleware sync)
export async function GET() {
  try {
    const config = await db.appConfig.findUnique({
      where: { id: 'default' },
      select: { waitlistMode: true, maintenanceMode: true },
    });

    const flags = {
      waitlistMode: config?.waitlistMode ?? false,
      maintenanceMode: config?.maintenanceMode ?? false,
    };

    // Create response with cookie for Edge middleware sync
    const response = NextResponse.json(flags);

    // Set feature flags cookie
    response.cookies.set(FEATURE_FLAGS_COOKIE, JSON.stringify(flags), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error loading feature flags:', error);
    return NextResponse.json(
      { error: 'Failed to load feature flags' },
      { status: 500 }
    );
  }
}
