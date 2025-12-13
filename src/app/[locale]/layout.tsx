import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Providers } from '@/components/providers';
import { ImpersonationWrapper } from '@/components/layout/impersonation-wrapper';
import { ServerThemeLoader } from '@/components/theme/server-theme-loader';
import { siteConfig } from '@/config/site';
import { locales, type Locale } from '@/i18n/config';
import { isDatabaseConfigured } from '@/lib/setup-mode';
import '../globals.css';

// Default site settings when database is not configured
const defaultSiteSettings = {
  siteName: 'ShipKit',
  siteIcon: 'Rocket',
  siteUrl: null,
  siteDescription: null,
};

// Fetch site settings from database
async function getSiteSettings() {
  // Skip database query if not configured (setup mode)
  if (!isDatabaseConfigured()) {
    return defaultSiteSettings;
  }

  try {
    // Dynamically import db to avoid initialization errors
    const { db } = await import('@/lib/db');

    const config = await db.appConfig.findUnique({
      where: { id: 'default' },
      select: {
        siteName: true,
        siteIcon: true,
        siteUrl: true,
        siteDescription: true,
      },
    });
    return config || defaultSiteSettings;
  } catch {
    return defaultSiteSettings;
  }
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'SaaS',
    'Boilerplate',
    'Next.js',
    'React',
    'TypeScript',
    'Tailwind CSS',
    'Prisma',
    'AI',
  ],
  authors: [
    {
      name: siteConfig.name,
      url: siteConfig.url,
    },
  ],
  creator: siteConfig.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    creator: '@shipkit',
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps): Promise<React.JSX.Element> {
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Load messages for the locale and site settings in parallel
  const [messages, siteSettings] = await Promise.all([
    getMessages(),
    getSiteSettings(),
  ]);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ServerThemeLoader />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ImpersonationWrapper />
        <NextIntlClientProvider messages={messages}>
          <Providers siteSettings={siteSettings}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
