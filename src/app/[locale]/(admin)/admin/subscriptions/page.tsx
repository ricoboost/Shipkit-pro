/**
 * Admin Subscriptions Page
 * Subscription management interface
 */

import { Suspense } from 'react';
import { admin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  searchParams: Promise<{ status?: string; plan?: string; page?: string }>;
}

async function SubscriptionsTable({
  status,
  plan,
  page,
}: {
  status?: string;
  plan?: string;
  page: number;
}) {
  const limit = 20;
  const offset = (page - 1) * limit;
  const t = await getTranslations('admin.subscriptions');

  const { subscriptions, total, hasMore } = await admin.listSubscriptions({
    status,
    plan,
    limit,
    offset,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('subscriptionsCount', { count: total })}</CardTitle>
        <CardDescription>{t('manageSubscriptions')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('customer')}</TableHead>
              <TableHead>{t('plan')}</TableHead>
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('provider')}</TableHead>
              <TableHead>{t('currentPeriod')}</TableHead>
              <TableHead>{t('created')}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => (
              <TableRow key={sub.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{sub.user.name || t('anonymous')}</p>
                    <p className="text-sm text-muted-foreground">{sub.user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge>{sub.plan}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      sub.status === 'ACTIVE'
                        ? 'default'
                        : sub.status === 'TRIALING'
                          ? 'secondary'
                          : sub.status === 'CANCELED'
                            ? 'destructive'
                            : 'outline'
                    }
                  >
                    {sub.status}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">{sub.provider.toLowerCase()}</TableCell>
                <TableCell>
                  {sub.currentPeriodStart && sub.currentPeriodEnd ? (
                    <span className="text-sm">
                      {new Date(sub.currentPeriodStart).toLocaleDateString()} -{' '}
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </span>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>
                  {new Date(sub.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    {t('manage')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {subscriptions.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            {t('noSubscriptions')}
          </p>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {t('showing', { start: offset + 1, end: Math.min(offset + limit, total), total })}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1}>
              {t('previous')}
            </Button>
            <Button variant="outline" size="sm" disabled={!hasMore}>
              {t('next')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminSubscriptionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status;
  const plan = params.plan;
  const page = parseInt(params.page || '1', 10);
  const t = await getTranslations('admin.subscriptions');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select defaultValue={status || 'all'}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allStatus')}</SelectItem>
            <SelectItem value="ACTIVE">{t('active')}</SelectItem>
            <SelectItem value="TRIALING">{t('trialing')}</SelectItem>
            <SelectItem value="PAST_DUE">{t('pastDue')}</SelectItem>
            <SelectItem value="CANCELED">{t('canceled')}</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue={plan || 'all'}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('plan')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allPlans')}</SelectItem>
            <SelectItem value="STARTER">{t('starter')}</SelectItem>
            <SelectItem value="PRO">{t('pro')}</SelectItem>
            <SelectItem value="ENTERPRISE">{t('enterprise')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Suspense fallback={<Card className="animate-pulse h-96" />}>
        <SubscriptionsTable status={status} plan={plan} page={page} />
      </Suspense>
    </div>
  );
}
