/**
 * Dynamic Sitemap Generator
 * Generates sitemap.xml for search engines
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next'
import { locales, defaultLocale } from '@/i18n/config'

// Base URL - should be set in environment
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

// Static pages that should be indexed
const staticPages = [
  '',
  '/pricing',
  '/features',
  '/about',
  '/contact',
  '/blog',
  '/docs',
  '/changelog',
  '/privacy',
  '/terms',
]

// Pages that should not have locale prefixes
const nonLocalizedPages: string[] = []

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = []

  // Add static pages for each locale
  for (const page of staticPages) {
    if (nonLocalizedPages.includes(page)) {
      // Non-localized pages
      sitemapEntries.push({
        url: `${BASE_URL}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      })
    } else {
      // Localized pages - add for each locale
      for (const locale of locales) {
        const localePath = locale === defaultLocale ? '' : `/${locale}`
        sitemapEntries.push({
          url: `${BASE_URL}${localePath}${page}`,
          lastModified: new Date(),
          changeFrequency: page === '' ? 'daily' : 'weekly',
          priority: page === '' ? 1.0 : locale === defaultLocale ? 0.8 : 0.6,
          alternates: {
            languages: Object.fromEntries(
              locales.map((l) => [
                l,
                `${BASE_URL}${l === defaultLocale ? '' : `/${l}`}${page}`,
              ])
            ),
          },
        })
      }
    }
  }

  // TODO: Add dynamic pages (blog posts, docs pages) by querying database
  // Example:
  // const posts = await db.post.findMany({ where: { published: true } })
  // for (const post of posts) {
  //   for (const locale of locales) {
  //     const localePath = locale === defaultLocale ? '' : `/${locale}`
  //     sitemapEntries.push({
  //       url: `${BASE_URL}${localePath}/blog/${post.slug}`,
  //       lastModified: post.updatedAt,
  //       changeFrequency: 'monthly',
  //       priority: 0.6,
  //     })
  //   }
  // }

  return sitemapEntries
}
