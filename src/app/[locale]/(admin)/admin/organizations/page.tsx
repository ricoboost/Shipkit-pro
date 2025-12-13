/**
 * Admin Organizations Page
 * Organization management interface with search and filters
 */

import { Suspense } from 'react';
import { admin } from '@/lib/admin';
import { Card } from '@/components/ui/card';
import { OrgSearchFilters } from '@/components/admin/org-search-filters';
import { OrganizationsTable } from '@/components/admin/organizations-table';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    plan?: string;
  }>;
}

async function OrganizationsTableWrapper({
  search,
  page,
  plan,
}: {
  search?: string;
  page: number;
  plan?: string;
}) {
  const limit = 20;

  const { organizations, total, hasMore } = await admin.listOrganizations({
    search,
    plan,
    limit,
    offset: (page - 1) * limit,
  });

  return (
    <OrganizationsTable
      organizations={organizations}
      total={total}
      hasMore={hasMore}
      page={page}
      limit={limit}
      filters={{ search, plan }}
    />
  );
}

export default async function AdminOrganizationsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search;
  const page = parseInt(params.page || '1', 10);
  const plan = params.plan;
  const t = await getTranslations('admin.organizations');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Search and Filters */}
      <OrgSearchFilters
        defaultSearch={search}
        defaultPlan={plan}
      />

      <Suspense fallback={<Card className="animate-pulse h-96" />}>
        <OrganizationsTableWrapper
          search={search}
          page={page}
          plan={plan}
        />
      </Suspense>
    </div>
  );
}
