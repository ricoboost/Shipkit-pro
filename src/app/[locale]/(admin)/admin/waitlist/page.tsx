/**
 * Admin Waitlist Page
 * Manage newsletter/waitlist subscribers
 */

import { Suspense } from 'react';
import { admin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WaitlistFilters } from '@/components/admin/waitlist-filters';
import { WaitlistTable } from '@/components/admin/waitlist-table';
import { Users, CheckCircle, Clock, UserMinus, TrendingUp } from 'lucide-react';
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

async function WaitlistStats() {
  const stats = await admin.getWaitlistStats();
  const t = await getTranslations('admin.waitlist');

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('totalSubscribers')}</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('confirmed')}</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.confirmed}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('pending')}</CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unconfirmed}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('unsubscribed')}</CardTitle>
          <UserMinus className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unsubscribed}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{t('thisWeek')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{stats.recentSignups}</div>
        </CardContent>
      </Card>
    </div>
  );
}

async function WaitlistTableWrapper({
  search,
  page,
  status,
  source,
  tag,
}: {
  search?: string;
  page: number;
  status?: string;
  source?: string;
  tag?: string;
}) {
  const limit = 20;

  const { subscribers, total, hasMore } = await admin.listWaitlistSubscribers({
    search,
    status: status as 'all' | 'confirmed' | 'unconfirmed' | 'unsubscribed' | undefined,
    source,
    tag,
    limit,
    offset: (page - 1) * limit,
  });

  const stats = await admin.getWaitlistStats();

  return (
    <WaitlistTable
      subscribers={subscribers}
      total={total}
      hasMore={hasMore}
      page={page}
      limit={limit}
      filters={{ search, status, source, tag }}
      availableTags={Object.keys(stats.tags)}
      availableSources={Object.keys(stats.bySource)}
    />
  );
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
