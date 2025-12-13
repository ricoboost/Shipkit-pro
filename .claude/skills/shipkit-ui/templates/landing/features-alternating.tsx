/**
 * FeaturesAlternating
 * Alternating rows of text and images for detailed feature explanations.
 * Best for: Product tours, detailed feature pages, storytelling
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Check } from 'lucide-react';
import Image from 'next/image';

interface FeatureRow {
  /** Optional badge text */
  badge?: string;
  /** Feature title */
  title: string;
  /** Feature description */
  description: string;
  /** List of bullet points */
  bullets?: string[];
  /** CTA button text */
  ctaText?: string;
  /** CTA button link */
  ctaHref?: string;
  /** Feature image source */
  imageSrc: string;
  /** Feature image alt text */
  imageAlt: string;
}

interface FeaturesAlternatingProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of feature rows */
  features: FeatureRow[];
  /** Additional CSS classes */
  className?: string;
}

export function FeaturesAlternating({
  title,
  subtitle,
  features,
  className,
}: FeaturesAlternatingProps) {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="mx-auto mb-16 max-w-3xl text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Feature Rows */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                'grid items-center gap-12 lg:grid-cols-2 lg:gap-16',
                index % 2 === 1 && 'lg:[&>*:first-child]:order-2'
              )}
            >
              {/* Text Content */}
              <div className="flex flex-col">
                {feature.badge && (
                  <Badge variant="secondary" className="mb-4 w-fit">
                    {feature.badge}
                  </Badge>
                )}

                <h3 className="text-2xl font-bold sm:text-3xl md:text-4xl">
                  {feature.title}
                </h3>

                <p className="mt-4 text-lg text-muted-foreground">
                  {feature.description}
                </p>

                {/* Bullet Points */}
                {feature.bullets && feature.bullets.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li
                        key={bulletIndex}
                        className="flex items-start gap-3"
                      >
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                        <span className="text-muted-foreground">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CTA Button */}
                {feature.ctaText && feature.ctaHref && (
                  <div className="mt-8">
                    <Button asChild>
                      <a href={feature.ctaHref}>
                        {feature.ctaText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted shadow-xl">
                  <Image
                    src={feature.imageSrc}
                    alt={feature.imageAlt}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Decorative elements */}
                <div
                  className={cn(
                    'absolute -z-10 h-full w-full rounded-xl bg-primary/10',
                    index % 2 === 0
                      ? '-bottom-4 -right-4'
                      : '-bottom-4 -left-4'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Default features for demonstration
export const defaultAlternatingFeatures: FeatureRow[] = [
  {
    badge: 'Authentication',
    title: 'Multiple auth providers, zero lock-in',
    description:
      'Switch between NextAuth, Supabase, and Better Auth with a single environment variable. No code changes required.',
    bullets: [
      'Social logins (Google, GitHub, Discord, etc.)',
      'Magic link authentication',
      '2FA with TOTP and backup codes',
      'Session management and device tracking',
    ],
    ctaText: 'Learn about auth',
    ctaHref: '/docs/auth',
    imageSrc: '/images/features/auth-preview.png',
    imageAlt: 'Authentication system preview',
  },
  {
    badge: 'Payments',
    title: 'Accept payments from day one',
    description:
      'Integrated billing with Stripe, LemonSqueezy, or Polar. Subscription management, usage-based billing, and credit systems included.',
    bullets: [
      'One-time and recurring payments',
      'Usage-based billing with credits',
      'Customer portal integration',
      'Webhook handling built-in',
    ],
    ctaText: 'View payment docs',
    ctaHref: '/docs/payments',
    imageSrc: '/images/features/payments-preview.png',
    imageAlt: 'Payment system preview',
  },
  {
    badge: 'Internationalization',
    title: 'Go global from day one',
    description:
      'Full i18n support with 7 languages out of the box. RTL support, locale detection, and translation management included.',
    bullets: [
      'English, Spanish, French, German, Portuguese, Japanese, Chinese',
      'Automatic locale detection',
      'SEO-friendly URL structure',
      'Easy to add more languages',
    ],
    ctaText: 'Explore i18n',
    ctaHref: '/docs/i18n',
    imageSrc: '/images/features/i18n-preview.png',
    imageAlt: 'Internationalization preview',
  },
];

// Example usage:
// <FeaturesAlternating
//   title="Powerful features for modern SaaS"
//   subtitle="Everything you need, nothing you don't"
//   features={defaultAlternatingFeatures}
// />
