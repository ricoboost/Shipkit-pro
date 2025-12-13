/**
 * User Language Preference API Route
 * Get and update user's preferred language
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { locales, type Locale } from '@/i18n/config';

export const dynamic = 'force-dynamic';

// GET - Get current user's language preference
export async function GET() {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { preferredLanguage: true },
    });

    return NextResponse.json({
      language: user?.preferredLanguage || 'en',
    });
  } catch (error) {
    console.error('Error getting language preference:', error);
    return NextResponse.json(
      { error: 'Failed to get language preference' },
      { status: 500 }
    );
  }
}

// PATCH - Update user's language preference
export async function PATCH(request: Request) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { language } = body;

    // Validate language
    if (!language || !locales.includes(language as Locale)) {
      return NextResponse.json(
        { error: 'Invalid language' },
        { status: 400 }
      );
    }

    // Update user's preference
    await db.user.update({
      where: { id: session.user.id },
      data: { preferredLanguage: language },
    });

    // Set cookie for middleware to use
    const response = NextResponse.json({ success: true, language });
    response.cookies.set('NEXT_LOCALE', language, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error updating language preference:', error);
    return NextResponse.json(
      { error: 'Failed to update language preference' },
      { status: 500 }
    );
  }
}
