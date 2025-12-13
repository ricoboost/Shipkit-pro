'use client';

/**
 * Language Switcher Component
 * Allows users to switch between available languages
 */

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  /** If true, saves the preference to the user's account */
  savePreference?: boolean;
  /** Show only the flag, hide the text */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

export function LanguageSwitcher({
  savePreference = false,
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLanguageChange = async (newLocale: string) => {
    // Build new path with the new locale
    const segments = pathname.split('/');
    // Replace the locale segment (first segment after empty string)
    if (segments[1] && locales.includes(segments[1] as Locale)) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join('/') || `/${newLocale}`;

    // Save preference to user account if requested and logged in
    if (savePreference && session?.user?.id) {
      try {
        await fetch('/api/user/language', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ language: newLocale }),
        });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }

    router.push(newPath);
  };

  if (compact) {
    return (
      <Select value={locale} onValueChange={handleLanguageChange}>
        <SelectTrigger className={`w-[70px] ${className || ''}`}>
          <SelectValue>
            <span className="flex items-center justify-center">
              <span className="text-lg">{localeFlags[locale]}</span>
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
    );
  }

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className={`w-[160px] ${className || ''}`}>
        <SelectValue>
          <span className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-lg">{localeFlags[locale]}</span>
            <span>{localeNames[locale]}</span>
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
  );
}
