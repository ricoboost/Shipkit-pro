import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { db } from '@/lib/db';
import { WelcomeHero, BentoGrid } from '@/components/home';
import { HomeNavLogo } from '@/components/home/home-nav-logo';
import { BookOpen, Github } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';

async function checkSetupComplete(): Promise<boolean> {
  try {
    // Check if any admin user exists - only select id and role to avoid schema mismatch issues
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    return !!adminUser;
  } catch (error) {
    // Log the error for debugging
    console.error('Setup check error:', error);
    // If database has any users at all, consider setup complete
    // This handles schema mismatch cases where admin exists but query fails
    try {
      const anyUser = await db.user.findFirst({
        select: { id: true },
      });
      if (anyUser) {
        // Database has users, likely a schema mismatch - don't redirect to onboarding
        return true;
      }
    } catch {
      // Database truly not connected
    }
    return false;
  }
}

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const isSetupComplete = await checkSetupComplete();

  // Redirect to onboarding if setup is not complete
  if (!isSetupComplete) {
    redirect(`/${locale}/onboarding`);
  }

  const t = await getTranslations('home');

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <HomeNavLogo />
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/docs">
                <BookOpen className="mr-2 h-4 w-4" />
                {t('nav.docs')}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
              </a>
            </Button>
            <Button size="sm" asChild>
              <Link href="/dashboard">{t('nav.dashboard')}</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <WelcomeHero />
        <BentoGrid />
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">{t('footer.tagline')}</p>
            <LanguageSwitcher compact />
          </div>
        </div>
      </footer>
    </div>
  );
}
