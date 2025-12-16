/**
 * Waitlist Page Query Utilities
 * Shared functions for fetching waitlist page data
 */

import { db } from '@/lib/db';
import { createDefaultPageConfig } from './defaults';
import type { WaitlistPageConfig } from './types';

export interface PublishedWaitlistPage {
  config: WaitlistPageConfig;
  published: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
}

/**
 * Get the published waitlist page if it exists and is published
 * Returns null if no page exists or page is not published
 */
export async function getPublishedWaitlistPage(): Promise<PublishedWaitlistPage | null> {
  try {
    const page = await db.waitlistPage.findUnique({
      where: { id: 'default' },
      select: {
        config: true,
        published: true,
        metaTitle: true,
        metaDescription: true,
        ogImage: true,
      },
    });

    if (!page || !page.published) {
      return null;
    }

    return {
      config: page.config as unknown as WaitlistPageConfig,
      published: page.published,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      ogImage: page.ogImage,
    };
  } catch (error) {
    console.error('Error fetching published waitlist page:', error);
    return null;
  }
}

/**
 * Get waitlist page config (whether published or not)
 * Falls back to default config if not found
 */
export async function getWaitlistPageConfig(): Promise<WaitlistPageConfig> {
  try {
    const page = await db.waitlistPage.findUnique({
      where: { id: 'default' },
      select: { config: true },
    });

    return page?.config
      ? (page.config as unknown as WaitlistPageConfig)
      : createDefaultPageConfig();
  } catch {
    return createDefaultPageConfig();
  }
}
