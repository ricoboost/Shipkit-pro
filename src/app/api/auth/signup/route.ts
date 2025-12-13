/**
 * Sign Up API Route
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

// Common passwords to reject
const COMMON_PASSWORDS = [
  'password', 'password1', 'password123', '12345678', '123456789',
  'qwerty123', 'letmein', 'welcome', 'admin123', 'iloveyou',
  'sunshine', 'princess', 'football', 'monkey123', 'abc12345',
];

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .refine(
      (pwd) => !COMMON_PASSWORDS.includes(pwd.toLowerCase()),
      'This password is too common. Please choose a stronger password.'
    ),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Rate limit: 5 attempts per hour to prevent bot signups
    const { allowed, headers } = await withRateLimit(req, rateLimitPresets.authStrict);
    if (!allowed) {
      return Response.json(
        { error: 'Too many signup attempts. Please try again later.' },
        { status: 429, headers }
      );
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, referralCode } = parsed.data;

    const result = await auth.signUp({
      name,
      email,
      password,
      referralCode,
    });

    if (result.error) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({ user: result.user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }

    console.error('Sign up error:', error);
    return Response.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
