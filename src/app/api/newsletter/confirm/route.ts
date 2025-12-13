/**
 * Newsletter Confirm API Route
 *
 * SECURITY: Rate limited to prevent token enumeration attacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletter } from '@/lib/newsletter';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

export async function GET(req: NextRequest) {
  try {
    // SECURITY: Rate limit to prevent token enumeration
    const { allowed, headers } = await withRateLimit(req, rateLimitPresets.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    const subscriber = await newsletter.confirm(token);

    if (!subscriber) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    // Redirect to success page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/newsletter/confirmed`);
  } catch (error) {
    console.error('Newsletter confirm error:', error);
    return NextResponse.json(
      { error: 'Failed to confirm subscription' },
      { status: 500 }
    );
  }
}
