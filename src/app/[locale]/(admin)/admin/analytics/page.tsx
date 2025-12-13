/**
 * Admin Analytics Page
 * Usage analytics and insights
 */

import { Suspense } from 'react';
import { admin } from '@/lib/admin';
import { newsletter } from '@/lib/newsletter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getTranslations } from 'next-intl/server';

async function AIUsageStats() {
  const stats = await admin.getDashboardStats();
  const t = await getTranslations('admin.analytics');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('aiUsage')}</CardTitle>
        <CardDescription>{t('apiUsageStats')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">{t('totalRequests')}</p>
            <p className="text-2xl font-bold">{stats.ai.totalRequests.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('totalTokens')}</p>
            <p className="text-2xl font-bold">{stats.ai.totalTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('creditsUsed')}</p>
            <p className="text-2xl font-bold">{stats.ai.totalCreditsUsed.toLocaleString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function TopModels() {
  const analytics = await admin.getAnalytics();
  const t = await getTranslations('admin.analytics');

  const totalRequests = analytics.topModels.reduce((sum, m) => sum + m._count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('topAIModels')}</CardTitle>
        <CardDescription>{t('topModelsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {analytics.topModels.map((model) => {
          const percentage = totalRequests > 0 ? (model._count / totalRequests) * 100 : 0;
          return (
            <div key={model.model} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium truncate">{model.model}</span>
                <span className="text-sm text-muted-foreground">
                  {model._count.toLocaleString()} {t('requests')}
                </span>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
        {analytics.topModels.length === 0 && (
          <p className="text-muted-foreground text-center py-4">{t('noData')}</p>
        )}
      </CardContent>
    </Card>
  );
}

async function NewsletterStats() {
  const stats = await newsletter.getStats();
  const t = await getTranslations('admin.analytics');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('newsletter')}</CardTitle>
        <CardDescription>{t('subscriberStats')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('totalSubscribers')}</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('confirmed')}</p>
            <p className="text-2xl font-bold">{stats.confirmed}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('unconfirmed')}</p>
            <p className="text-2xl font-bold">{stats.unconfirmed}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('newThisWeek')}</p>
            <p className="text-2xl font-bold">{stats.recentSignups}</p>
          </div>
        </div>

        {Object.keys(stats.bySource).length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">{t('bySource')}</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.bySource).map(([source, count]) => (
                <Badge key={source} variant="secondary">
                  {source}: {count}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

async function UserGrowth() {
  const stats = await admin.getDashboardStats();
  const t = await getTranslations('admin.analytics');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('userGrowth')}</CardTitle>
        <CardDescription>{t('userAcquisition')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('totalUsers')}</p>
            <p className="text-2xl font-bold">{stats.users.total}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('newThisWeek')}</p>
            <p className="text-2xl font-bold text-green-600">+{stats.users.newThisWeek}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('newThisMonth')}</p>
            <p className="text-2xl font-bold text-green-600">+{stats.users.newThisMonth}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('conversionRate')}</p>
            <p className="text-2xl font-bold">
              {stats.users.total > 0
                ? ((stats.subscriptions.active / stats.users.total) * 100).toFixed(1)
                : 0}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function RevenueMetrics() {
  const stats = await admin.getDashboardStats();
  const t = await getTranslations('admin.analytics');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('revenue')}</CardTitle>
        <CardDescription>{t('monthlyRecurring')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">{t('mrr')}</p>
            <p className="text-2xl font-bold">
              ${stats.revenue.thisMonth.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('lastMonth')}</p>
            <p className="text-2xl font-bold">
              ${stats.revenue.lastMonth.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('growth')}</p>
            <p className={`text-2xl font-bold ${stats.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.revenue.growth >= 0 ? '+' : ''}{stats.revenue.growth.toFixed(1)}%
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">{t('activeSubscriptionsByPlan')}</p>
          <div className="flex gap-2">
            <Badge>{t('active')}: {stats.subscriptions.active}</Badge>
            <Badge variant="secondary">{t('trialing')}: {stats.subscriptions.trialing}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminAnalyticsPage() {
  const t = await getTranslations('admin.analytics');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Suspense fallback={<Card className="animate-pulse h-48" />}>
        <UserGrowth />
      </Suspense>

      <Suspense fallback={<Card className="animate-pulse h-48" />}>
        <RevenueMetrics />
      </Suspense>

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<Card className="animate-pulse h-64" />}>
          <AIUsageStats />
        </Suspense>

        <Suspense fallback={<Card className="animate-pulse h-64" />}>
          <TopModels />
        </Suspense>
      </div>

      <Suspense fallback={<Card className="animate-pulse h-48" />}>
        <NewsletterStats />
      </Suspense>
    </div>
  );
}
