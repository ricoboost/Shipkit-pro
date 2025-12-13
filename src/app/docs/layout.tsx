import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { baseOptions } from '@/app/layout.config';
import { source } from '@/lib/docs/source';
import { LanguageSwitcher } from '@/components/docs/language-switcher';
import { defaultLocale } from '@/i18n/config';
import { DocsProviders } from '@/components/providers/docs-providers';
import { siteConfig } from '@/config/site';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: `Documentation | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name} Docs`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} font-sans antialiased`}>
        <DocsProviders>
          <RootProvider
            search={{
              enabled: true,
              options: {
                api: `/api/search?locale=${defaultLocale}`,
              },
            }}
          >
            <DocsLayout
              tree={source.pageTree}
              {...baseOptions}
              sidebar={{
                banner: <LanguageSwitcher currentLocale={defaultLocale} />,
              }}
            >
              {children}
            </DocsLayout>
          </RootProvider>
        </DocsProviders>
      </body>
    </html>
  );
}
