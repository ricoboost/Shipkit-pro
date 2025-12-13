/**
 * Admin Users Page
 * User management interface with search, filters, and bulk actions
 */

import { Suspense } from 'react';
import { admin } from '@/lib/admin';
import { Card } from '@/components/ui/card';
import { UserSearchFilters } from '@/components/admin/user-search-filters';
import { UsersTable } from '@/components/admin/users-table';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    role?: string;
    status?: string;
    plan?: string;
  }>;
}

async function UsersTableWrapper({
  search,
  page,
  role,
  status,
  plan,
}: {
  search?: string;
  page: number;
  role?: string;
  status?: string;
  plan?: string;
}) {
  const limit = 20;

  const { users, total, hasMore } = await admin.listUsers({
    search,
    role,
    status,
    plan,
    limit,
    offset: (page - 1) * limit,
  });

  // Serialize dates for client component
  const serializedUsers = users.map((user) => ({
    ...user,
    createdAt: user.createdAt,
  }));

  return (
    <UsersTable
      users={serializedUsers}
      total={total}
      hasMore={hasMore}
      page={page}
      limit={limit}
      filters={{ search, role, status, plan }}
    />
  );
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const search = params.search;
  const page = parseInt(params.page || '1', 10);
  const role = params.role;
  const status = params.status;
  const plan = params.plan;
  const t = await getTranslations('admin.users');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Search and Filters */}
      <UserSearchFilters
        defaultSearch={search}
        defaultRole={role}
        defaultStatus={status}
        defaultPlan={plan}
      />

      <Suspense fallback={<Card className="animate-pulse h-96" />}>
        <UsersTableWrapper
          search={search}
          page={page}
          role={role}
          status={status}
          plan={plan}
        />
      </Suspense>
    </div>
  );
}
