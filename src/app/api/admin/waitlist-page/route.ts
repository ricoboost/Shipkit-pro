/**
 * Waitlist Page API Route
 * Save and load waitlist page configuration from the database
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { createDefaultPageConfig } from '@/lib/waitlist-builder';
import type { Prisma } from '@prisma/client';

// GET - Load current page configuration
export async function GET() {
  try {
    const page = await db.waitlistPage.findUnique({
      where: { id: 'default' },
    });

    if (!page) {
      // Return default config if none saved
      return NextResponse.json({
        config: createDefaultPageConfig(),
        published: false,
        metaTitle: null,
        metaDescription: null,
        ogImage: null,
      });
    }

    return NextResponse.json({
      config: page.config,
      published: page.published,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
    });
  } catch (error) {
    console.error('Error loading waitlist page:', error);
    return NextResponse.json(
      { error: 'Failed to load waitlist page' },
      { status: 500 }
    );
  }
}

// PUT - Save page configuration (admin only)
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
    const { config, metaTitle, metaDescription, ogImage } = body;

    if (!config) {
      return NextResponse.json(
        { error: 'Config is required' },
        { status: 400 }
      );
    }

    // Validate config structure
    if (!config.version || !config.sections || !config.globalStyles) {
      return NextResponse.json(
        { error: 'Invalid config structure' },
        { status: 400 }
      );
    }

    // Save page to database
    const page = await db.waitlistPage.upsert({
      where: { id: 'default' },
      update: {
        config,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
      },
      create: {
        id: 'default',
        config,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        ogImage: ogImage || null,
      },
    });

    return NextResponse.json({
      success: true,
      config: page.config,
      published: page.published,
    });
  } catch (error) {
    console.error('Error saving waitlist page:', error);
    return NextResponse.json(
      { error: 'Failed to save waitlist page' },
      { status: 500 }
    );
  }
}

// POST - Publish/unpublish page (admin only)
export async function POST(request: Request) {
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
    const { publish } = body;

    if (typeof publish !== 'boolean') {
      return NextResponse.json(
        { error: 'publish must be a boolean' },
        { status: 400 }
      );
    }

    // Check if page exists
    const existingPage = await db.waitlistPage.findUnique({
      where: { id: 'default' },
    });

    if (!existingPage) {
      // Create with default config if not exists
      const page = await db.waitlistPage.create({
        data: {
          id: 'default',
          config: JSON.parse(JSON.stringify(createDefaultPageConfig())) as Prisma.InputJsonValue,
          published: publish,
        },
      });

      return NextResponse.json({
        success: true,
        published: page.published,
      });
    }

    // Update publish status
    const page = await db.waitlistPage.update({
      where: { id: 'default' },
      data: { published: publish },
    });

    return NextResponse.json({
      success: true,
      published: page.published,
    });
  } catch (error) {
    console.error('Error publishing waitlist page:', error);
    return NextResponse.json(
      { error: 'Failed to publish waitlist page' },
      { status: 500 }
    );
  }
}

// DELETE - Reset page to defaults (admin only)
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

    // Reset to default config
    const defaultConfig = JSON.parse(JSON.stringify(createDefaultPageConfig())) as Prisma.InputJsonValue;

    await db.waitlistPage.upsert({
      where: { id: 'default' },
      update: {
        config: defaultConfig,
        published: false,
        metaTitle: null,
        metaDescription: null,
        ogImage: null,
      },
      create: {
        id: 'default',
        config: defaultConfig,
      },
    });

    return NextResponse.json({
      success: true,
      config: defaultConfig,
    });
  } catch (error) {
    console.error('Error resetting waitlist page:', error);
    return NextResponse.json(
      { error: 'Failed to reset waitlist page' },
      { status: 500 }
    );
  }
}
