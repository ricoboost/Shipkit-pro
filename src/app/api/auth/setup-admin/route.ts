/**
 * Admin Setup API Route
 * Creates the first admin user during initial setup
 * Only works if no admin exists yet
 *
 * SECURITY: Requires ADMIN_SETUP_TOKEN environment variable for protection
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { isDatabaseConfigured } from '@/lib/setup-mode';
import { withRateLimit, rateLimitPresets } from '@/lib/security/rate-limit';

// Strong password requirements for admin accounts
const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain a special character'),
  setupToken: z.string().optional(),
});

export async function POST(req: NextRequest): Promise<Response> {
  try {
    // Check if database is configured
    if (!isDatabaseConfigured()) {
      return Response.json(
        { error: 'Database is not configured. Please set up your DATABASE_URL first.' },
        { status: 503 }
      );
    }

    // Rate limit: 5 attempts per hour
    const { allowed, headers } = await withRateLimit(req, rateLimitPresets.authStrict);
    if (!allowed) {
      return Response.json(
        { error: 'Too many setup attempts. Please try again later.' },
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

    const { name, email, password, setupToken } = parsed.data;

    // SECURITY: Require setup token in production
    const requiredToken = process.env.ADMIN_SETUP_TOKEN;
    if (requiredToken && setupToken !== requiredToken) {
      return Response.json(
        { error: 'Invalid setup token' },
        { status: 401 }
      );
    }

    // Check if an admin already exists
    const existingAdmin = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return Response.json(
        { error: 'An admin account already exists. Please login instead.' },
        { status: 400 }
      );
    }

    // Check if email is already taken
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return Response.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create admin user
    const user = await db.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
        authProvider: 'NEXTAUTH',
        emailVerified: new Date(), // Auto-verify admin
      },
    });

    // Grant signup bonus credits (non-blocking - don't fail if this errors)
    const bonusCredits = parseInt(process.env.SIGNUP_BONUS_CREDITS || '100', 10);
    if (bonusCredits > 0) {
      try {
        await db.creditBalance.create({
          data: {
            userId: user.id,
            balance: bonusCredits,
            ledger: {
              create: {
                amount: bonusCredits,
                type: 'GRANT',
                description: 'Admin setup bonus',
              },
            },
          },
        });
      } catch (creditError) {
        // Log but don't fail - admin was created successfully
        console.warn('Failed to grant signup bonus credits:', creditError);
      }
    }

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: error.issues[0].message }, { status: 400 });
    }

    // Log detailed error for debugging
    console.error('Admin setup error:', error);

    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return Response.json(
      { error: `Failed to create admin account: ${errorMessage}` },
      { status: 500 }
    );
  }
}
