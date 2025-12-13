/**
 * Setup Status API Route
 * Returns the overall setup status of the application
 * Used by middleware and client to determine if onboarding is needed
 *
 * SECURITY: In production, only returns setupComplete boolean to prevent info disclosure
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SetupStatus {
  setupComplete: boolean;
  checks?: {
    hasEnvFile: boolean;
    dbConnected: boolean;
    adminExists: boolean;
  };
}

export async function GET(req: NextRequest) {
  // Rate limit to prevent enumeration
  const { allowed, headers } = await withRateLimit(req, rateLimitPresets.api);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers }
    );
  }

  const isProduction = process.env.NODE_ENV === 'production';

  // 1. Check if DATABASE_URL environment variable exists
  const hasEnvFile = !!process.env.DATABASE_URL;

  // 2. Check database connection
  let dbConnected = false;
  if (hasEnvFile) {
    try {
      await db.$queryRaw`SELECT 1`;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }
  }

  // 3. Check if admin exists
  let adminExists = false;
  if (dbConnected) {
    try {
      const admin = await db.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true },
      });
      adminExists = !!admin;
    } catch {
      adminExists = false;
    }
  }

  // Setup is complete only if an admin exists
  const setupComplete = adminExists;

  // SECURITY: In production, only return setupComplete to prevent info disclosure
  const response: SetupStatus = isProduction
    ? { setupComplete }
    : {
        setupComplete,
        checks: {
          hasEnvFile,
          dbConnected,
          adminExists,
        },
      };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
