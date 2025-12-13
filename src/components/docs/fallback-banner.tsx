'use client';

import { AlertTriangle } from 'lucide-react';
import { localeNames } from '@/i18n/config';

interface FallbackBannerProps {
  locale: string;
}

export function FallbackBanner({ locale }: FallbackBannerProps) {
  const languageName = localeNames[locale as keyof typeof localeNames] || locale;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
      <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
      <div>
        <p className="font-medium text-amber-700 dark:text-amber-400">
          Translation not available
        </p>
        <p className="text-sm text-amber-600 dark:text-amber-300">
          This page is not yet available in {languageName}. Showing English version.
        </p>
      </div>
    </div>
  );
}
