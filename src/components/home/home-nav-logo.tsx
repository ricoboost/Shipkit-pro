'use client';

import Link from 'next/link';
import { useSiteSettings } from '@/contexts/site-settings-context';
import { DynamicIcon } from '@/components/ui/icon-picker';

export function HomeNavLogo() {
  const { siteName, siteIcon } = useSiteSettings();

  return (
    <Link href="/" className="flex items-center gap-2">
      <DynamicIcon name={siteIcon} className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold">{siteName}</span>
    </Link>
  );
}
