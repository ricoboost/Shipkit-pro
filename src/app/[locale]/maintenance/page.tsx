/**
 * Maintenance Page
 *
 * Shown to non-admin users when maintenance mode is enabled.
 * Admins are automatically redirected to the dashboard.
 */

import { Wrench, ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function MaintenancePage() {
  const t = await getTranslations('maintenance');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md mx-auto px-4 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Wrench className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
          <p className="text-muted-foreground text-lg mb-6">
            {t('description')}
          </p>
          <p className="text-sm text-muted-foreground">
            {t('checkBack')}
          </p>
        </div>

        <div className="space-y-4">
          <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('backToHome')}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
