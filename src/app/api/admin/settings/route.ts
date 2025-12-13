/**
 * Admin Settings API Route
 * Update site settings and providers
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// PATCH - Update settings (admin only)
export async function PATCH(request: Request) {
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
    const {
      // Site settings
      siteName,
      siteIcon,
      siteUrl,
      siteDescription,
      // Providers
      authProvider,
      paymentProvider,
      aiProvider,
      // Language
      defaultLanguage,
    } = body;

    // Build update object with only the provided fields
    const updateData: Record<string, unknown> = {};

    if (siteName !== undefined) updateData.siteName = siteName;
    if (siteIcon !== undefined) updateData.siteIcon = siteIcon;
    if (siteUrl !== undefined) updateData.siteUrl = siteUrl;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription;
    if (authProvider !== undefined) updateData.authProvider = authProvider;
    if (paymentProvider !== undefined) updateData.paymentProvider = paymentProvider;
    if (aiProvider !== undefined) updateData.aiProvider = aiProvider;
    if (defaultLanguage !== undefined) updateData.defaultLanguage = defaultLanguage;

    // Update the config
    const config = await db.appConfig.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData },
    });

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// GET - Get current settings
export async function GET() {
  try {
    const config = await db.appConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      return NextResponse.json({
        siteName: 'ShipKit',
        siteIcon: 'Rocket',
        siteUrl: null,
        siteDescription: null,
        authProvider: 'NEXTAUTH',
        paymentProvider: 'STRIPE',
        aiProvider: 'OPENROUTER',
        defaultLanguage: 'en',
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error loading settings:', error);
    return NextResponse.json(
      { error: 'Failed to load settings' },
      { status: 500 }
    );
  }
}
