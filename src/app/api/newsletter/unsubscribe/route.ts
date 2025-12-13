/**
 * Newsletter Unsubscribe API Route
 *
 * SECURITY: Rate limited to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletter } from '@/lib/newsletter';
import { z } from 'zod';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

const unsubscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// POST - Unsubscribe by email
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit to prevent abuse
    const { allowed, headers } = await withRateLimit(req, rateLimitPresets.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await req.json();
    const parsed = unsubscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const success = await newsletter.unsubscribe(parsed.data.email);

    if (!success) {
      return NextResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}

// GET - Unsubscribe by token (one-click unsubscribe)
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

    const success = await newsletter.unsubscribeByToken(token);

    if (!success) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    // Redirect to unsubscribed page
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${baseUrl}/newsletter/unsubscribed`);
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
