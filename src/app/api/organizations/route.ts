/**
 * Organizations API Route
 * List and create organizations
 *
 * SECURITY: Validates slug format and prevents reserved words
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { organizations } from '@/lib/organizations';
import { z } from 'zod';
import { withRateLimit } from '@/lib/security/rate-limit';

// Reserved slugs that could conflict with routes
const RESERVED_SLUGS = [
  'admin', 'api', 'auth', 'login', 'logout', 'register', 'signup',
  'dashboard', 'settings', 'billing', 'help', 'support', 'docs',
  'blog', 'about', 'privacy', 'terms', 'contact', 'home', 'app',
  'www', 'mail', 'email', 'ftp', 'ssh', 'cdn', 'static', 'assets',
];

const createOrgSchema = z.object({
  name: z.string().min(2).max(100),
  // SECURITY: Stricter slug validation
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50)
    // Must start and end with alphanumeric, no consecutive dashes
    .regex(
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
      'Slug must start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens'
    )
    .refine(
      (slug) => !RESERVED_SLUGS.includes(slug),
      'This slug is reserved. Please choose a different one.'
    )
    .refine(
      (slug) => !slug.includes('--'),
      'Slug cannot contain consecutive dashes'
    )
    .optional(),
  // SECURITY: Validate logo URL domain (only allow known CDNs in production)
  logo: z
    .string()
    .url()
    .refine(
      (url) => {
        // In production, validate against allowed domains
        if (process.env.NODE_ENV !== 'production') return true;
        const allowedDomains = [
          'https://cdn.example.com',
          'https://images.unsplash.com',
          'https://avatars.githubusercontent.com',
          'https://lh3.googleusercontent.com',
        ];
        return allowedDomains.some((domain) => url.startsWith(domain)) ||
          url.startsWith('data:image/');
      },
      'Logo must be from an approved image source'
    )
    .optional(),
});

// GET /api/organizations - List user's organizations
export async function GET() {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgs = await organizations.getUserOrganizations(session.user.id);

    return NextResponse.json({ organizations: orgs });
  } catch (error) {
    console.error('Get organizations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

// POST /api/organizations - Create organization
export async function POST(req: NextRequest) {
  try {
    // SECURITY: Rate limit org creation to prevent spam (10 per day per user)
    const { allowed, headers } = await withRateLimit(req, {
      windowMs: 24 * 60 * 60 * 1000, // 24 hours
      maxRequests: 10,
    });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many organizations created. Please try again later.' },
        { status: 429, headers }
      );
    }

    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = createOrgSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const org = await organizations.create({
      ...parsed.data,
      ownerId: session.user.id,
    });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create organization' },
      { status: 500 }
    );
  }
}
