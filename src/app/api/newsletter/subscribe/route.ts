/**
 * Newsletter Subscribe API Route
 *
 * SECURITY: Returns generic response to prevent email enumeration
 */

import { NextRequest, NextResponse } from 'next/server';
import { newsletter } from '@/lib/newsletter';
import { z } from 'zod';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

const subscribeSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 60 requests per minute
    const { allowed, headers } = await withRateLimit(req, rateLimitPresets.api);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await req.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, source, tags } = parsed.data;

    await newsletter.subscribe({
      email,
      source,
      tags,
    });

    // SECURITY: Always return the same response to prevent email enumeration
    // Don't reveal whether the email was new or already exists
    return NextResponse.json({
      success: true,
      message: 'If this email is not already subscribed, you will receive a confirmation email.',
    });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    // SECURITY: Don't expose internal errors
    return NextResponse.json(
      { error: 'Unable to process subscription request' },
      { status: 500 }
    );
  }
}
