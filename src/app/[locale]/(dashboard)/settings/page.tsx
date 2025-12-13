'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { User, CreditCard, Bell, Shield, Key, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

interface SettingsSection {
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  href: string;
}

const settingsSections: SettingsSection[] = [
  {
    titleKey: 'profile',
    descriptionKey: 'profileDesc',
    icon: User,
    href: '/settings/profile',
  },
  {
    titleKey: 'billing',
    descriptionKey: 'billingDesc',
    icon: CreditCard,
    href: '/settings/billing',
  },
  {
    titleKey: 'apiKeys',
    descriptionKey: 'apiKeysDesc',
    icon: Key,
    href: '/settings/api-keys',
  },
  {
    titleKey: 'security',
    descriptionKey: 'securityDesc',
    icon: Shield,
    href: '/settings/security',
  },
];

export default function SettingsPage(): React.JSX.Element {
  const t = useTranslations('settings');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {/* Settings navigation cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {settingsSections.map((section) => (
          <Card
            key={section.titleKey}
            className="transition-shadow hover:shadow-md"
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{t(`sections.${section.titleKey}`)}</CardTitle>
                  <CardDescription className="text-xs">
                    {t(`sections.${section.descriptionKey}`)}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href={section.href}>{t('manage', { section: t(`sections.${section.titleKey}`) })}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>{t('notifications.title')}</CardTitle>
              <CardDescription>
                {t('notifications.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('notifications.email')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.emailDesc')}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('notifications.marketing')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.marketingDesc')}
              </p>
            </div>
            <Switch />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t('notifications.security')}</Label>
              <p className="text-sm text-muted-foreground">
                {t('notifications.securityDesc')}
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-destructive/10 p-2">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">{t('dangerZone.title')}</CardTitle>
              <CardDescription>
                {t('dangerZone.description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-medium">{t('dangerZone.deleteAccount')}</p>
              <p className="text-sm text-muted-foreground">
                {t('dangerZone.deleteAccountDesc')}
              </p>
            </div>
            <Button variant="destructive">{t('dangerZone.deleteButton')}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
