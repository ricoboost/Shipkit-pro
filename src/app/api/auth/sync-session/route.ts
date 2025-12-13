/**
 * Sync Session API Route
 *
 * Sets cookies needed by Edge middleware:
 * - shipkit-is-admin: Indicates if user is admin (for maintenance mode bypass)
 * - shipkit-feature-flags: Current feature flags state
 *
 * Call this after login to sync session state with middleware.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { FEATURE_FLAGS_COOKIE } from '@/lib/feature-flags/edge';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      // Clear cookies if not authenticated
      const response = NextResponse.json({ authenticated: false });
      response.cookies.delete('shipkit-is-admin');
      return response;
    }

    // Get user role from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    const isAdmin = user?.role === 'ADMIN';

    // Get feature flags
    const config = await db.appConfig.findUnique({
      where: { id: 'default' },
      select: { waitlistMode: true, maintenanceMode: true },
    });

    const flags = {
      waitlistMode: config?.waitlistMode ?? false,
      maintenanceMode: config?.maintenanceMode ?? false,
    };

    // Create response
    const response = NextResponse.json({
      authenticated: true,
      isAdmin,
      flags,
    });

    // Set admin cookie (httpOnly to prevent XSS reading admin status)
    response.cookies.set('shipkit-is-admin', isAdmin ? 'true' : 'false', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours (matches session)
    });

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
    console.error('Error syncing session:', error);
    return NextResponse.json(
      { error: 'Failed to sync session' },
      { status: 500 }
    );
  }
}

// GET - Same as POST but for initial page loads
export async function GET() {
  return POST();
}
