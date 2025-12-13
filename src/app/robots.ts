/**
 * Robots.txt Generator
 * Controls search engine crawling behavior
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // Private routes
          '/api/',
          '/dashboard/',
          '/admin/',
          '/settings/',

          // Auth routes
          '/auth/',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',

          // Internal routes
          '/_next/',
          '/static/',

          // Localized private routes
          '/*/dashboard/',
          '/*/admin/',
          '/*/settings/',
          '/*/auth/',
        ],
      },
      {
        // Block aggressive crawlers
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
