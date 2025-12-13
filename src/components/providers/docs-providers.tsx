'use client';

import { SessionProvider } from 'next-auth/react';
import { Toaster } from '@/components/ui/sonner';
import { DemoProvider } from '@/components/providers/demo-provider';

interface DocsProvidersProps {
  children: React.ReactNode;
}

/**
 * Providers for docs pages - excludes ThemeProvider since Fumadocs
 * RootProvider handles theming via its own ThemeProvider
 */
export function DocsProviders({ children }: DocsProvidersProps): React.JSX.Element {
  return (
    <SessionProvider>
      <DemoProvider>
        {children}
        <Toaster richColors position="top-right" />
      </DemoProvider>
    </SessionProvider>
  );
}
