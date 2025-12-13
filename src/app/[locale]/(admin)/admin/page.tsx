/**
 * Admin Dashboard Overview
 * Main admin dashboard with stats and activity
 */

import { Suspense } from 'react';
import Link from 'next/link';
import { admin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTranslations } from 'next-intl/server';

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

async function StatsCards() {
  const stats = await admin.getDashboardStats();
  const t = await getTranslations('admin.overview');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>{t('totalUsers')}</CardDescription>
          <CardTitle className="text-3xl">{formatNumber(stats.users.total)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            +{stats.users.newThisWeek} {t('thisWeek')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>{t('activeSubscriptions')}</CardDescription>
          <CardTitle className="text-3xl">{formatNumber(stats.subscriptions.active)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {stats.subscriptions.trialing} {t('trialing')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>{t('monthlyRevenue')}</CardDescription>
          <CardTitle className="text-3xl">{formatCurrency(stats.revenue.thisMonth)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-sm ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}% {t('fromLastMonth')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardDescription>{t('aiRequests')}</CardDescription>
          <CardTitle className="text-3xl">{formatNumber(stats.ai.totalRequests)}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {formatNumber(stats.ai.totalTokens)} {t('tokensUsed')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentActivity() {
  const activity = await admin.getRecentActivity();
  const t = await getTranslations('admin.overview');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Recent Users */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('recentSignups')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/users">{t('viewAll')}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.users.map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{user.name || t('anonymous')}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant="secondary">
                  {new Date(user.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            ))}
            {activity.users.length === 0 && (
              <p className="text-muted-foreground text-center py-4">{t('noRecentSignups')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('recentSubscriptionChanges')}</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/subscriptions">{t('viewAll')}</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activity.subscriptions.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{sub.user.name || sub.user.email}</p>
                  <p className="text-sm text-muted-foreground">{sub.plan}</p>
                </div>
                <Badge
                  variant={sub.status === 'ACTIVE' ? 'default' : 'secondary'}
                >
                  {sub.status}
                </Badge>
              </div>
            ))}
            {activity.subscriptions.length === 0 && (
              <p className="text-muted-foreground text-center py-4">{t('noRecentChanges')}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function RecentAIUsage() {
  const activity = await admin.getRecentActivity();
  const t = await getTranslations('admin.overview');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('recentAIUsage')}</CardTitle>
        <CardDescription>{t('latestAIRequests')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activity.aiUsage.map((usage) => (
            <div
              key={usage.id}
              className="flex items-center justify-between py-2 border-b last:border-0"
            >
              <div className="flex-1">
                <p className="font-medium">{usage.user.name || usage.user.email}</p>
                <p className="text-sm text-muted-foreground">{usage.model}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">{formatNumber(usage.totalTokens)} {t('tokens')}</p>
                <p className="text-xs text-muted-foreground">
                  {usage.creditsUsed} {t('credits')}
                </p>
              </div>
              <Badge variant="outline" className="ml-4">
                {usage.type}
              </Badge>
            </div>
          ))}
          {activity.aiUsage.length === 0 && (
            <p className="text-muted-foreground text-center py-4">{t('noRecentAIUsage')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const t = await getTranslations('admin.overview');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-8 bg-muted rounded w-16 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <StatsCards />
      </Suspense>

      <Suspense
        fallback={
          <div className="grid gap-6 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="animate-pulse h-64" />
            ))}
          </div>
        }
      >
        <RecentActivity />
      </Suspense>

      <Suspense fallback={<Card className="animate-pulse h-64" />}>
        <RecentAIUsage />
      </Suspense>
    </div>
  );
}
