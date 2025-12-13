import { getPagesForLocale } from '@/lib/docs/source';
import { createSearchAPI } from 'fumadocs-core/search/server';
import { locales, defaultLocale } from '@/i18n/config';
import { type NextRequest } from 'next/server';
import type { StructuredData } from 'fumadocs-core/mdx-plugins';

type SearchIndex = {
  title: string;
  description?: string;
  url: string;
  id: string;
  structuredData: StructuredData;
};

// Lazy-initialized cache for search indexes
let cachedIndexes: SearchIndex[] | null = null;
let searchAPI: ReturnType<typeof createSearchAPI> | null = null;

// Create search indexes for all locales with error handling
function createAllIndexesSafe(): SearchIndex[] {
  if (cachedIndexes) return cachedIndexes;

  const allIndexes: SearchIndex[] = [];

  for (const locale of locales) {
    try {
      const pages = getPagesForLocale(locale);
      for (const page of pages) {
        // Bounds check - skip pages with invalid slugs
        if (!page?.slugs?.length) continue;

        // Get slug without locale prefix
        const slugWithoutLocale = page.slugs.slice(1);
        const path = slugWithoutLocale.join('/');

        // Build correct URL based on locale
        const url =
          locale === defaultLocale
            ? `/docs${path ? `/${path}` : ''}`
            : `/${locale}/docs${path ? `/${path}` : ''}`;

        allIndexes.push({
          title: page.data?.title ?? 'Untitled',
          description: page.data?.description,
          url,
          id: `${locale}:${url}`,
          structuredData: page.data?.structuredData ?? { headings: [], contents: [] },
        });
      }
    } catch (error) {
      // Log but continue - one bad locale shouldn't break the entire search
      console.error(`[Search] Failed to index locale "${locale}":`, error);
    }
  }

  cachedIndexes = allIndexes;
  return allIndexes;
}

// Lazy initialization of search API
function getSearchAPI() {
  if (searchAPI) return searchAPI;

  const indexes = createAllIndexesSafe();
  searchAPI = createSearchAPI('advanced', { indexes });
  return searchAPI;
}

export async function GET(request: NextRequest) {
  try {
    // Get locale from query param or header
    const locale =
      request.nextUrl.searchParams.get('locale') ||
      request.headers.get('x-locale') ||
      defaultLocale;

    // Get search API (lazy init)
    const api = getSearchAPI();

    // Filter search results to current locale
    const response = await api.GET(request);
    const data = await response.json();

    // Filter results to match the requested locale
    if (data && Array.isArray(data)) {
      const filtered = data.filter((item: { id?: string }) =>
        item.id?.startsWith(`${locale}:`)
      );
      return Response.json(filtered);
    }

    return response;
  } catch (error) {
    console.error('[Search] API error:', error);
    return Response.json(
      { error: 'Search unavailable', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 503 }
    );
  }
}
