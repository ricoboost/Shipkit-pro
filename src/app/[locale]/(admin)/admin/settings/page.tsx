/**
 * Admin Settings Page
 * Feature flags, site settings, and provider configuration
 */

import { getTranslations } from 'next-intl/server';
import { admin } from '@/lib/admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FeatureFlagsManager } from '@/components/admin/feature-flags-manager';
import { SiteSettingsEditor } from '@/components/admin/site-settings-editor';
import { ProviderSelector } from '@/components/admin/provider-selector';
import { LanguageSettings } from '@/components/admin/language-settings';
import { Settings, ToggleLeft, Globe, Plug, Languages } from 'lucide-react';

export default async function AdminSettingsPage() {
  const config = await admin.getAppConfig();
  const t = await getTranslations('admin.settings');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5" />
              {t('featureFlags.title')}
            </CardTitle>
            <CardDescription>
              {t('featureFlags.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FeatureFlagsManager config={config} />
          </CardContent>
        </Card>

        {/* Site Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('siteSettings.title')}
            </CardTitle>
            <CardDescription>
              {t('siteSettings.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SiteSettingsEditor config={config} />
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="h-5 w-5" />
              {t('language.title')}
            </CardTitle>
            <CardDescription>
              {t('language.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LanguageSettings config={config} />
          </CardContent>
        </Card>

        {/* Provider Configuration */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              {t('providers.title')}
            </CardTitle>
            <CardDescription>
              {t('providers.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProviderSelector config={config} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
