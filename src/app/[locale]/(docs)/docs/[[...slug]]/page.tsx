import { getPageForLocale, generateParamsForLocale } from '@/lib/docs/source';
import {
  DocsPage,
  DocsBody,
  DocsDescription,
  DocsTitle,
} from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { Metadata } from 'next';
import { locales, defaultLocale } from '@/i18n/config';
import { FallbackBanner } from '@/components/docs/fallback-banner';
import { docsComponents } from '@/components/docs/mdx-components';

export default async function Page(props: {
  params: Promise<{ locale: string; slug?: string[] }>;
}) {
  const { locale, slug } = await props.params;

  // Redirect English to /docs (no prefix)
  if (locale === defaultLocale) {
    const path = slug ? `/docs/${slug.join('/')}` : '/docs';
    redirect(path);
  }

  let page = getPageForLocale(locale, slug);
  let showFallback = false;

  // Fallback to English if page not found in locale
  if (!page) {
    page = getPageForLocale(defaultLocale, slug);
    showFallback = true;
  }

  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      footer={{ enabled: false }}
    >
      {showFallback && <FallbackBanner locale={locale} />}
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={{ ...defaultMdxComponents, ...docsComponents }} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string[] }[] = [];

  for (const locale of locales.filter((l) => l !== defaultLocale)) {
    const localeParams = generateParamsForLocale(locale);
    params.push(...localeParams.map((p) => ({ locale, slug: p.slug })));
  }

  return params;
}

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug?: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  let page = getPageForLocale(locale, slug);

  if (!page) {
    page = getPageForLocale(defaultLocale, slug);
  }

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
