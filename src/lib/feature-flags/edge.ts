/**
 * Edge-compatible Feature Flags
 *
 * This module provides feature flag reading for Edge runtime (middleware).
 * Since Prisma can't run on Edge, we use cookies to sync flag state.
 *
 * Cookie format: JSON string with waitlistMode and maintenanceMode booleans
 */

import type { NextRequest } from 'next/server';

export const FEATURE_FLAGS_COOKIE = 'shipkit-feature-flags';

export interface FeatureFlags {
  waitlistMode: boolean;
  maintenanceMode: boolean;
}

/**
 * Get feature flags from cookie (Edge-compatible)
 * Returns default (permissive) flags if cookie is missing or invalid
 */
export function getFeatureFlagsFromCookie(request: NextRequest): FeatureFlags {
  const defaultFlags: FeatureFlags = {
    waitlistMode: false,
    maintenanceMode: false,
  };

  try {
    const cookie = request.cookies.get(FEATURE_FLAGS_COOKIE)?.value;
    if (!cookie) {
      return defaultFlags;
    }

    const parsed = JSON.parse(cookie);
    return {
      waitlistMode: parsed.waitlistMode === true,
      maintenanceMode: parsed.maintenanceMode === true,
    };
  } catch {
    // If cookie is invalid, return permissive defaults
    return defaultFlags;
  }
}

/**
 * Check if current user is admin based on session cookie
 * We check for the admin indicator cookie set during login
 */
export function isAdminFromCookie(request: NextRequest): boolean {
  const adminCookie = request.cookies.get('shipkit-is-admin')?.value;
  return adminCookie === 'true';
}

/**
 * Paths that should bypass maintenance mode checks
 */
export const MAINTENANCE_BYPASS_PATHS = [
  '/maintenance',
  '/login',
  '/api/auth',
  '/onboarding',
  '/_next',
  '/favicon.ico',
];

/**
 * Paths that should bypass waitlist mode checks (these paths are blocked for new signups)
 */
export const WAITLIST_PROTECTED_PATHS = [
  '/register',
];

/**
 * Check if path should bypass maintenance mode
 */
export function shouldBypassMaintenance(pathname: string): boolean {
  return MAINTENANCE_BYPASS_PATHS.some(path => pathname.includes(path));
}

/**
 * Check if path is protected by waitlist mode
 */
export function isWaitlistProtectedPath(pathname: string): boolean {
  return WAITLIST_PROTECTED_PATHS.some(path => pathname.includes(path));
}
