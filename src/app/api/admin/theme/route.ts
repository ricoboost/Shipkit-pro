/**
 * Theme API Route
 * Save and load theme configuration from the database
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { themePresets } from '@/lib/theme';
import { Prisma } from '@prisma/client';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Load current theme
export async function GET() {
  try {
    const config = await db.appConfig.findUnique({
      where: { id: 'default' },
      select: { theme: true },
    });

    if (!config?.theme) {
      // Return default theme if none saved
      return NextResponse.json(
        { theme: themePresets.default },
        {
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        }
      );
    }

    return NextResponse.json(
      { theme: config.theme },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (error) {
    console.error('Error loading theme:', error);
    return NextResponse.json(
      { error: 'Failed to load theme' },
      { status: 500 }
    );
  }
}

// PUT - Save theme (admin only)
export async function PUT(request: Request) {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { theme } = body;

    if (!theme) {
      return NextResponse.json({ error: 'Theme is required' }, { status: 400 });
    }

    // Validate theme structure
    if (!theme.name || !theme.light || !theme.dark || !theme.radius) {
      return NextResponse.json(
        { error: 'Invalid theme structure' },
        { status: 400 }
      );
    }

    // Save theme to database
    await db.appConfig.upsert({
      where: { id: 'default' },
      update: { theme },
      create: { id: 'default', theme },
    });

    return NextResponse.json({ success: true, theme });
  } catch (error) {
    console.error('Error saving theme:', error);
    return NextResponse.json(
      { error: 'Failed to save theme' },
      { status: 500 }
    );
  }
}

// DELETE - Reset theme to default (admin only)
export async function DELETE() {
  try {
    const session = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Reset theme to null (will use default)
    await db.appConfig.upsert({
      where: { id: 'default' },
      update: { theme: Prisma.DbNull },
      create: { id: 'default' },
    });

    return NextResponse.json({ success: true, theme: themePresets.default });
  } catch (error) {
    console.error('Error resetting theme:', error);
    return NextResponse.json(
      { error: 'Failed to reset theme' },
      { status: 500 }
    );
  }
}
