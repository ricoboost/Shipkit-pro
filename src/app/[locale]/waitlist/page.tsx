import { Metadata } from 'next';
import { db } from '@/lib/db';
import { createDefaultPageConfig } from '@/lib/waitlist-builder';
import { PageRenderer } from '@/components/waitlist-builder/preview/page-renderer';
import type { WaitlistPageConfig } from '@/lib/waitlist-builder/types';

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.waitlistPage.findUnique({
    where: { id: 'default' },
    select: { metaTitle: true, metaDescription: true, ogImage: true },
  });

  return {
    title: page?.metaTitle || 'Join the Waitlist',
    description: page?.metaDescription || 'Be the first to know when we launch.',
    openGraph: page?.ogImage
      ? {
          images: [page.ogImage],
        }
      : undefined,
  };
}

export default async function WaitlistPage() {
  // Load page configuration
  const page = await db.waitlistPage.findUnique({
    where: { id: 'default' },
  });

  // Use saved config or default
  const config: WaitlistPageConfig = page?.config
    ? (page.config as unknown as WaitlistPageConfig)
    : createDefaultPageConfig();

  // Check if page is published (or show default for development)
  const isPublished = page?.published ?? false;

  // In production, you might want to show a 404 or coming soon page
  // if the page is not published. For now, we'll show the default template.
  if (!isPublished && process.env.NODE_ENV === 'production') {
    // Optionally redirect or show a different page
    // For now, we'll still show the page
  }

  return <PageRenderer config={config} />;
}
