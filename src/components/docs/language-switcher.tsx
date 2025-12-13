'use client';

import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { locales, localeNames, localeFlags, defaultLocale, type Locale } from '@/i18n/config';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: Locale) => {
    // Get the current path without locale prefix
    let pathWithoutLocale = pathname;

    // Remove current locale prefix if present (for non-English)
    for (const locale of locales) {
      if (locale !== defaultLocale && pathname.startsWith(`/${locale}/docs`)) {
        pathWithoutLocale = pathname.replace(`/${locale}`, '');
        break;
      }
    }

    // Build new path
    let newPath: string;
    if (newLocale === defaultLocale) {
      // English uses /docs without locale prefix
      newPath = pathWithoutLocale;
    } else {
      // Other locales use /{locale}/docs
      newPath = `/${newLocale}${pathWithoutLocale}`;
    }

    // Use full page navigation to ensure theme state is preserved
    // (navigating between /docs and /[locale]/docs crosses different root layouts)
    window.location.href = newPath;
  };

  const currentLanguageName = localeNames[currentLocale as Locale] || currentLocale;
  const currentFlag = localeFlags[currentLocale as Locale] || '🌐';

  return (
    <div className="w-full pb-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-between gap-2"
          >
            <span className="flex items-center gap-2">
              <span className="text-lg">{currentFlag}</span>
              <span>{currentLanguageName}</span>
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[200px]">
          {locales.map((locale) => (
            <DropdownMenuItem
              key={locale}
              onClick={() => handleLanguageChange(locale)}
              className={locale === currentLocale ? 'bg-accent' : ''}
            >
              <span className="mr-2 text-lg">{localeFlags[locale]}</span>
              {localeNames[locale]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
