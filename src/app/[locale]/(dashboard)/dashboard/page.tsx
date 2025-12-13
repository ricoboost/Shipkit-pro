'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CreditCard,
  Users,
  Zap,
  TrendingUp,
  ArrowRight,
  FileText,
  Settings,
  HelpCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type ChangeType = 'positive' | 'negative' | 'neutral';

interface Stat {
  titleKey: string;
  value: string;
  change: string;
  changeType: ChangeType;
  icon: LucideIcon;
}

const stats: Stat[] = [
  {
    titleKey: 'creditsRemaining',
    value: '2,450',
    change: '+12%',
    changeType: 'positive',
    icon: Zap,
  },
  {
    titleKey: 'aiRequests',
    value: '1,234',
    change: '+8%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    titleKey: 'teamMembers',
    value: '5',
    change: '0',
    changeType: 'neutral',
    icon: Users,
  },
  {
    titleKey: 'currentPlan',
    value: 'Pro',
    change: 'Active',
    changeType: 'positive',
    icon: CreditCard,
  },
];

interface QuickAction {
  titleKey: string;
  descriptionKey: string;
  href: string;
  icon: LucideIcon;
}

const quickActions: QuickAction[] = [
  {
    titleKey: 'aiPlayground',
    descriptionKey: 'aiPlaygroundDesc',
    href: '/ai-playground',
    icon: Zap,
  },
  {
    titleKey: 'documentation',
    descriptionKey: 'documentationDesc',
    href: '/docs',
    icon: FileText,
  },
  {
    titleKey: 'settings',
    descriptionKey: 'settingsDesc',
    href: '/settings',
    icon: Settings,
  },
  {
    titleKey: 'getHelp',
    descriptionKey: 'getHelpDesc',
    href: '/support',
    icon: HelpCircle,
  },
];

export default function DashboardPage(): React.JSX.Element {
  const { user } = useAuth();
  const t = useTranslations('dashboard');

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('welcomeBack', { name: user?.name?.split(' ')[0] || t('there') })}
        </h1>
        <p className="text-muted-foreground">
          {t('accountOverview')}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.titleKey}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t(`stats.${stat.titleKey}`)}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p
                className={`text-xs ${
                  stat.changeType === 'positive'
                    ? 'text-green-600'
                    : stat.changeType === 'negative'
                    ? 'text-red-600'
                    : 'text-muted-foreground'
                }`}
              >
                {stat.change} {t('fromLastMonth')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">{t('quickActions')}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Card
              key={action.titleKey}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t(`actions.${action.titleKey}`)}</CardTitle>
                    <CardDescription className="text-xs">
                      {t(`actions.${action.descriptionKey}`)}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between" asChild>
                  <Link href={action.href}>
                    {t('goTo', { page: t(`actions.${action.titleKey}`) })}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>{t('recentActivity')}</CardTitle>
          <CardDescription>
            {t('recentActivityDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-muted p-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t('noRecentActivity')}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {t('startUsing')}
            </p>
            <Button className="mt-4" asChild>
              <Link href="/ai-playground">
                {t('tryAiPlayground')} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
