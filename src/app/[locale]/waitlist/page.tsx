import { Metadata } from 'next';
import { db } from '@/lib/db';
import { getWaitlistPageConfig } from '@/lib/waitlist-builder';
import { PageRenderer } from '@/components/waitlist-builder/preview/page-renderer';

export async function generateMetadata(): Promise<Metadata> {
  const page = await db.waitlistPage.findUnique({
    where: { id: 'default' },
    select: { metaTitle: true, metaDescription: true, ogImage: true },
  });

  return {
    title: page?.metaTitle || 'Join the Waitlist',
    description: page?.metaDescription || 'Be the first to know when we launch.',
    openGraph: page?.ogImage
      ? { images: [page.ogImage] }
      : undefined,
  };
}

export default async function WaitlistPage() {
  // Load page configuration using shared utility (falls back to default)
  const config = await getWaitlistPageConfig();

  return <PageRenderer config={config} />;
}
