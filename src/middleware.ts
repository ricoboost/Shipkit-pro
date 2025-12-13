/**
 * Middleware
 * Handles internationalization, auth protection, and feature flag enforcement
 *
 * SECURITY: Basic auth check via session token presence
 * Admin role verification is handled at the page level (layout.tsx) for better security
 *
 * FEATURE FLAGS:
 * - maintenanceMode: Blocks all non-admin users, redirects to /maintenance
 * - waitlistMode: Blocks new signups, redirects /register to /join-waitlist
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';
import {
  getFeatureFlagsFromCookie,
  isAdminFromCookie,
  shouldBypassMaintenance,
  isWaitlistProtectedPath,
} from '@/lib/feature-flags/edge';

// Create the internationalization middleware
const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication (without locale prefix)
const protectedRoutes = ['/dashboard', '/settings', '/ai-playground', '/admin'];

// Routes that are only for guests (redirect to dashboard if authenticated)
const guestRoutes = ['/login', '/register', '/forgot-password'];

// Extract path without locale prefix
function getPathWithoutLocale(pathname: string): string {
  const localePattern = /^\/(en|es|fr|de|pt|ja|zh)(\/|$)/;
  return pathname.replace(localePattern, '/');
}

// Get locale from path
function getLocaleFromPath(pathname: string): string {
  const match = pathname.match(/^\/(en|es|fr|de|pt|ja|zh)(\/|$)/);
  return match ? match[1] : 'en';
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Skip API routes
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Skip locale processing for English docs (they live at /docs without locale prefix)
  if (pathname.startsWith('/docs')) {
    return NextResponse.next();
  }

  // Get the path without locale and locale for routing
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  const locale = getLocaleFromPath(pathname);

  // Check for env var bypass (emergency recovery)
  const bypassMaintenance = process.env.BYPASS_MAINTENANCE === 'true';

  // FEATURE FLAG ENFORCEMENT
  if (!bypassMaintenance) {
    const flags = getFeatureFlagsFromCookie(request);
    const isAdmin = isAdminFromCookie(request);

    // Maintenance mode: Block everyone except admins
    if (flags.maintenanceMode && !isAdmin) {
      if (!shouldBypassMaintenance(pathname)) {
        return NextResponse.redirect(new URL(`/${locale}/maintenance`, request.url));
      }
    }

    // Waitlist mode: Block new signups only
    if (flags.waitlistMode && !isAdmin) {
      if (isWaitlistProtectedPath(pathWithoutLocale)) {
        return NextResponse.redirect(new URL(`/${locale}/join-waitlist`, request.url));
      }
    }
  }

  // First, handle internationalization
  const intlResponse = intlMiddleware(request);

  // Check for session token (NextAuth v5 / Auth.js uses 'authjs' prefix)
  const sessionToken =
    request.cookies.get('authjs.session-token')?.value ||
    request.cookies.get('__Secure-authjs.session-token')?.value;

  const isAuthenticated = !!sessionToken;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathWithoutLocale.startsWith(route));
  const isGuestRoute = guestRoutes.some((route) => pathWithoutLocale.startsWith(route));

  // Redirect unauthenticated users from protected routes
  // Note: Admin routes require auth here, role check happens in layout.tsx
  if (isProtectedRoute && !isAuthenticated) {
    const url = new URL(`/${locale}/login`, request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from guest routes
  if (isGuestRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};
