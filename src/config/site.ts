/**
 * Site Configuration
 */

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'ShipKit',
  description: 'The AI-native SaaS boilerplate for vibecoding',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Links
  links: {
    twitter: 'https://twitter.com/shipkit',
    github: 'https://github.com/shipkit',
    docs: '/docs',
  },

  // Creator
  creator: {
    name: 'ShipKit',
    url: 'https://shipkit.io',
  },

  // Keywords for SEO
  keywords: [
    'SaaS',
    'boilerplate',
    'starter kit',
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'AI',
    'authentication',
    'payments',
  ],
} as const;

export type SiteConfig = typeof siteConfig;
