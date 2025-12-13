'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Zap, Calendar, Download, ArrowUpRight } from 'lucide-react';

// Mock data - will be replaced with real data from API
const billingData = {
  plan: 'Pro',
  status: 'active',
  price: '$19/month',
  nextBilling: 'January 15, 2025',
  credits: {
    used: 7550,
    total: 10000,
  },
  paymentMethod: {
    type: 'card',
    last4: '4242',
    expiry: '12/25',
  },
  invoices: [
    { id: '1', date: 'Dec 15, 2024', amount: '$19.00', status: 'paid' },
    { id: '2', date: 'Nov 15, 2024', amount: '$19.00', status: 'paid' },
    { id: '3', date: 'Oct 15, 2024', amount: '$19.00', status: 'paid' },
  ],
};

export default function BillingSettingsPage(): React.JSX.Element {
  const t = useTranslations('settings.billing');
  const creditsPercentage =
    (billingData.credits.used / billingData.credits.total) * 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('currentPlan')}</CardTitle>
              <CardDescription>
                {t('currentPlanDesc', { plan: billingData.plan })}
              </CardDescription>
            </div>
            <Badge variant="default">{t(`status.${billingData.status}`)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{billingData.plan}</p>
              <p className="text-sm text-muted-foreground">
                {billingData.price}
              </p>
            </div>
            <div className="space-x-2">
              <Button variant="outline">{t('changePlan')}</Button>
              <Button variant="destructive" size="sm">
                {t('cancel')}
              </Button>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('nextBilling', { date: billingData.nextBilling })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Credits usage */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('creditsUsage')}</CardTitle>
              <CardDescription>
                {t('creditsUsageDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>
                {t('creditsUsed', {
                  used: billingData.credits.used.toLocaleString(),
                  total: billingData.credits.total.toLocaleString()
                })}
              </span>
              <span className="font-medium">{creditsPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={creditsPercentage} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              {t('buyMoreCredits')}
            </Button>
            <Button variant="ghost" size="sm">
              {t('viewUsageHistory')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment method */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('paymentMethod')}</CardTitle>
              <CardDescription>
                {t('paymentMethodDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-md border p-2">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">
                  •••• •••• •••• {billingData.paymentMethod.last4}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('expires', { date: billingData.paymentMethod.expiry })}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              {t('update')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Billing history */}
      <Card>
        <CardHeader>
          <CardTitle>{t('billingHistory')}</CardTitle>
          <CardDescription>
            {t('billingHistoryDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {billingData.invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-muted-foreground">
                    {invoice.amount}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                  >
                    {t(`invoiceStatus.${invoice.status}`)}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <Button variant="outline" className="w-full">
            {t('viewAllInvoices')}
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
