import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { defaultLocale } from '@/i18n/config';

// Base loader without locale filtering
const baseSource = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
});

// Infer types from the loader
type PageTreeRoot = typeof baseSource.pageTree;
type PageTreeNode = PageTreeRoot['children'][number];
type PageTreeFolder = Extract<PageTreeNode, { type: 'folder' }>;

// ============================================================================
// CACHES FOR PERFORMANCE
// ============================================================================

// Module-level cache for page trees (persists across requests)
const pageTreeCache = new Map<string, PageTreeRoot>();

// URL transform cache to avoid repeated string operations
const urlTransformCache = new Map<string, string>();

// ============================================================================
// CORE FUNCTIONS WITH NULL SAFETY
// ============================================================================

// Get a page for a specific locale
export function getPageForLocale(locale: string, slug?: string[]) {
  // Construct the full slug with locale prefix
  const fullSlug = slug ? [locale, ...slug] : [locale];
  return baseSource.getPage(fullSlug);
}

// Get all pages for a specific locale (with null safety)
export function getPagesForLocale(locale: string) {
  return baseSource.getPages().filter(page =>
    // Null-safe check: Pages have slugs like ['en', 'getting-started', 'installation']
    page?.slugs?.[0] === locale
  );
}

// Generate params for a locale
export function generateParamsForLocale(locale: string) {
  const pages = getPagesForLocale(locale);
  return pages.map(page => ({
    slug: page.slugs?.slice(1) ?? [], // Remove locale from slugs, with null safety
  }));
}

// ============================================================================
// OPTIMIZED URL TRANSFORMATION
// ============================================================================

// Cached URL transformation
function transformUrl(url: string, locale: string): string {
  const cacheKey = `${locale}:${url}`;

  const cached = urlTransformCache.get(cacheKey);
  if (cached !== undefined) return cached;

  let newUrl = url;
  const prefix = `/docs/${locale}`;

  if (url.startsWith(prefix)) {
    const pathWithoutLocale = url.slice(prefix.length);
    newUrl = locale === defaultLocale
      ? `/docs${pathWithoutLocale}`
      : `/${locale}/docs${pathWithoutLocale}`;
  }

  urlTransformCache.set(cacheKey, newUrl);
  return newUrl;
}

// Optimized page tree URL transformation with structural sharing
function transformPageTreeUrls(
  node: PageTreeNode,
  locale: string
): PageTreeNode {
  if (!node) return node;

  if (node.type === 'page') {
    const newUrl = transformUrl(node.url, locale);
    // Only create new object if URL actually changed
    return newUrl === node.url ? node : { ...node, url: newUrl };
  }

  if (node.type === 'folder') {
    const newChildren = node.children?.map((child) =>
      transformPageTreeUrls(child, locale)
    ) ?? [];

    // Only create new object if children actually changed
    const childrenChanged = newChildren.some((c, i) => c !== node.children?.[i]);
    return childrenChanged ? { ...node, children: newChildren } : node;
  }

  return node;
}

// ============================================================================
// MEMOIZED PAGE TREE FUNCTIONS
// ============================================================================

// Internal implementation for getting page tree
function getPageTreeForLocaleInternal(locale: string): PageTreeRoot {
  // Check cache first
  const cached = pageTreeCache.get(locale);
  if (cached) return cached;

  const fullTree = baseSource.pageTree;

  // The page tree folders have URLs like /docs/en, /docs/fr, etc.
  // We need to find the folder by checking its index page URL or first page URL
  const localeFolder = fullTree.children.find((node): node is PageTreeFolder => {
    if (node?.type !== 'folder') return false;
    // Check if the folder's index page matches this locale
    if (node.index?.url?.startsWith(`/docs/${locale}`)) {
      return true;
    }
    // Or check if any child page matches this locale (with null safety)
    const children = node.children ?? [];
    if (children.length > 0) {
      const firstChild = children[0];
      if (firstChild?.type === 'page' && firstChild.url?.startsWith(`/docs/${locale}`)) {
        return true;
      }
    }
    return false;
  });

  let result: PageTreeRoot;

  if (!localeFolder) {
    // Fallback to English if locale folder not found
    const enFolder = fullTree.children.find((node): node is PageTreeFolder => {
      if (node?.type !== 'folder') return false;
      if (node.index?.url?.startsWith(`/docs/${defaultLocale}`)) {
        return true;
      }
      const children = node.children ?? [];
      if (children.length > 0) {
        const firstChild = children[0];
        if (firstChild?.type === 'page' && firstChild.url?.startsWith(`/docs/${defaultLocale}`)) {
          return true;
        }
      }
      return false;
    });

    if (enFolder) {
      result = {
        name: fullTree.name,
        children: (enFolder.children ?? []).map((child) =>
          transformPageTreeUrls(child, defaultLocale)
        ),
      };
    } else {
      result = fullTree;
    }
  } else {
    // Return the locale-specific tree with transformed URLs
    result = {
      name: fullTree.name,
      children: (localeFolder.children ?? []).map((child) =>
        transformPageTreeUrls(child, locale)
      ),
    };
  }

  // Cache the result
  pageTreeCache.set(locale, result);
  return result;
}

// Export the memoized function directly (uses module-level cache)
export function getPageTreeForLocale(locale: string): PageTreeRoot {
  return getPageTreeForLocaleInternal(locale);
}

// Pre-warm cache for default locale (runs once at module load)
try {
  getPageTreeForLocaleInternal(defaultLocale);
} catch {
  // Ignore pre-warm errors - they'll surface on actual usage
}

// ============================================================================
// BACKWARDS COMPATIBILITY
// ============================================================================

// For backwards compatibility - use English locale
export const source = {
  getPage: (slug?: string[]) => getPageForLocale(defaultLocale, slug),
  getPages: () => getPagesForLocale(defaultLocale),
  generateParams: () => generateParamsForLocale(defaultLocale),
  pageTree: getPageTreeForLocale(defaultLocale),
};
