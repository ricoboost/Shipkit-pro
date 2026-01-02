'use client';

/**
 * Language Settings Component for Admin
 * Configure default language and display available locales
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { LanguageSwitcher } from '@/components/language-switcher';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface AppConfig {
  id: string;
  defaultLanguage?: string;
}

interface LanguageSettingsProps {
  config: AppConfig;
}

export function LanguageSettings({ config }: LanguageSettingsProps) {
  const t = useTranslations('admin.settings.language');
  const tCommon = useTranslations('common');
  const [defaultLanguage, setDefaultLanguage] = useState<Locale>(
    (config.defaultLanguage as Locale) || 'en'
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDefault = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultLanguage }),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      toast.success('Default language updated');
    } catch (error) {
      console.error('Error saving default language:', error);
      toast.error('Failed to update default language');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Default Language */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium">{t('defaultLanguage')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('defaultLanguageDesc')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={defaultLanguage}
              onValueChange={(value) => setDefaultLanguage(value as Locale)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{localeFlags[defaultLanguage]}</span>
                    <span>{localeNames[defaultLanguage]}</span>
                  </span>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {locales.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    <span className="flex items-center gap-2">
                      <span className="text-lg">{localeFlags[loc]}</span>
                      <span>{localeNames[loc]}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleSaveDefault}
              disabled={isSaving || defaultLanguage === config.defaultLanguage}
              size="sm"
            >
              {isSaving ? tCommon('loading') : tCommon('save')}
            </Button>
          </div>
        </div>
      </div>

      {/* Current Language Switcher */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">{t('yourLanguage')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('yourLanguageDesc')}
          </p>
        </div>
        <LanguageSwitcher savePreference />
      </div>

      {/* Available Languages */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-medium">{t('availableLanguages')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('availableLanguagesDesc')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {locales.map((loc) => (
            <Badge
              key={loc}
              variant={loc === defaultLanguage ? 'default' : 'secondary'}
              className="flex items-center gap-1.5 py-1.5 px-3"
            >
              <span className="text-base">{localeFlags[loc]}</span>
              <span>{localeNames[loc]}</span>
              {loc === defaultLanguage && (
                <Check className="h-3 w-3 ml-1" />
              )}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
