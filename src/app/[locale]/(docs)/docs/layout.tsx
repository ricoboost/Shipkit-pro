import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { RootProvider } from 'fumadocs-ui/provider/next';
import type { ReactNode } from 'react';
import { baseOptions } from '@/app/layout.config';
import { getPageTreeForLocale } from '@/lib/docs/source';
import { LanguageSwitcher } from '@/components/docs/language-switcher';

export default async function Layout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Get the page tree for this locale (currently returns full tree)
  const pageTree = getPageTreeForLocale(locale);

  return (
    <RootProvider
      search={{
        enabled: true,
        options: {
          api: `/api/search?locale=${locale}`,
        },
      }}
    >
      <DocsLayout
        tree={pageTree}
        {...baseOptions}
        sidebar={{
          banner: <LanguageSwitcher currentLocale={locale} />,
        }}
      >
        {children}
      </DocsLayout>
    </RootProvider>
  );
}
