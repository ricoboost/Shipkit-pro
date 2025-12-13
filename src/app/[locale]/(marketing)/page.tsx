import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { isDatabaseConfigured } from '@/lib/setup-mode';
import {
  ArrowRight,
  Zap,
  Shield,
  CreditCard,
  Users,
  Bot,
  Palette,
  Check,
} from 'lucide-react';

// Check if setup is already complete
async function checkSetupComplete(): Promise<boolean> {
  // Skip database check if not configured (placeholder or missing)
  if (!isDatabaseConfigured()) {
    return false;
  }

  try {
    // Dynamically import db to avoid errors when DATABASE_URL is not set
    const { db } = await import('@/lib/db');

    // Check if at least one admin user exists
    const adminUser = await db.user.findFirst({
      where: { role: 'ADMIN' },
    });

    return !!adminUser;
  } catch {
    // If database query fails, setup is not complete
    return false;
  }
}

const features = [
  {
    icon: Shield,
    title: 'Multi-Provider Auth',
    description:
      'NextAuth, Supabase, or Better Auth - switch providers with a single env var',
  },
  {
    icon: CreditCard,
    title: 'Flexible Payments',
    description:
      'Stripe, LemonSqueezy, or Polar integration with credits-based billing',
  },
  {
    icon: Bot,
    title: 'AI-Native',
    description:
      'OpenRouter & Vercel AI SDK with built-in usage tracking and rate limiting',
  },
  {
    icon: Users,
    title: 'Multi-Tenancy',
    description:
      'Organizations, teams, roles, and permissions out of the box',
  },
  {
    icon: Palette,
    title: 'Visual Theming',
    description:
      'Built-in theme builder with shadcn/ui and Tailwind CSS',
  },
  {
    icon: Zap,
    title: 'AI-Documented',
    description:
      'AGENTS.md, .cursorrules, and comprehensive docs for AI assistants',
  },
];

const tiers = [
  {
    name: 'Starter',
    price: 129,
    description: 'Perfect for indie hackers and side projects',
    features: [
      'All core features',
      'Single auth provider',
      'Single payment provider',
      'Community support',
      'Lifetime updates',
    ],
  },
  {
    name: 'Pro',
    price: 199,
    description: 'For serious builders and small teams',
    popular: true,
    features: [
      'Everything in Starter',
      'All auth providers',
      'All payment providers',
      'AI integration',
      'Priority support',
      'Team features',
    ],
  },
  {
    name: 'Enterprise',
    price: 299,
    description: 'For agencies and large teams',
    features: [
      'Everything in Pro',
      'Multi-tenancy',
      'White-label support',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const { locale } = await params;
  const setupComplete = await checkSetupComplete();

  // Redirect to setup wizard if setup is not complete
  if (!setupComplete) {
    redirect(`/${locale}/setup`);
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border bg-muted px-4 py-1.5 text-sm">
              <span className="mr-2">🚀</span>
              <span>The AI-native SaaS boilerplate</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Ship Your SaaS{' '}
              <span className="text-primary">10x Faster</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              {siteConfig.description}. Built for the AI era with comprehensive
              documentation for Cursor, Windsurf, and Claude Code.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/register">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/docs">View Documentation</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.primary.900/20),transparent)]" />
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Everything You Need to Ship
            </h2>
            <p className="text-lg text-muted-foreground">
              A complete toolkit with multi-provider architecture. Switch auth,
              payments, or AI providers without code changes.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border bg-background p-6 transition-shadow hover:shadow-md"
              >
                <feature.icon className="mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-muted-foreground">
              One-time purchase. Lifetime updates. No subscriptions.
            </p>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl border bg-background p-8 ${
                  tier.popular
                    ? 'border-primary shadow-lg ring-1 ring-primary'
                    : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-medium text-primary-foreground">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="mb-2 text-xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center text-sm">
                      <Check className="mr-3 h-4 w-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={tier.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Ship Your SaaS?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of developers building faster with ShipKit. Get
              started in minutes, not months.
            </p>
            <Button size="lg" asChild>
              <Link href="/register">
                Get ShipKit Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
