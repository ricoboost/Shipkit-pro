'use client';

import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { DemoProvider } from '@/components/providers/demo-provider';
import { CustomThemeProvider } from '@/components/theme-provider';
import { SiteSettingsProvider, type SiteSettings } from '@/contexts/site-settings-context';

interface ProvidersProps {
  children: React.ReactNode;
  siteSettings?: Partial<SiteSettings>;
}

export function Providers({ children, siteSettings }: ProvidersProps): React.JSX.Element {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CustomThemeProvider>
          <SiteSettingsProvider settings={siteSettings || {}}>
            <DemoProvider>
              {children}
              <Toaster richColors position="top-right" />
            </DemoProvider>
          </SiteSettingsProvider>
        </CustomThemeProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
