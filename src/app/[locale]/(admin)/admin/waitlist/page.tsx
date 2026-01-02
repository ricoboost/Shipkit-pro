/**
 * Admin Waitlist Page
 * Manage newsletter/waitlist subscribers
 */

import { Suspense } from 'react';
import { admin } from '@/lib/admin';
import { Card } from '@/components/ui/card';
import { WaitlistFilters, WaitlistStats, WaitlistTableWrapper } from '@/components/admin/waitlist';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    status?: string;
    source?: string;
    tag?: string;
  }>;
}

export default async function AdminWaitlistPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search;
  const page = parseInt(params.page || '1', 10);
  const status = params.status;
  const source = params.source;
  const tag = params.tag;
  const t = await getTranslations('admin.waitlist');

  // Get stats for filters
  const stats = await admin.getWaitlistStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-5 animate-pulse h-24" />}>
        <WaitlistStats />
      </Suspense>

      {/* Search and Filters */}
      <WaitlistFilters
        defaultSearch={search}
        defaultStatus={status}
        defaultSource={source}
        defaultTag={tag}
        availableSources={Object.keys(stats.bySource)}
        availableTags={Object.keys(stats.tags)}
      />

      <Suspense fallback={<Card className="animate-pulse h-96" />}>
        <WaitlistTableWrapper
          search={search}
          page={page}
          status={status}
          source={source}
          tag={tag}
        />
      </Suspense>
    </div>
  );
}
