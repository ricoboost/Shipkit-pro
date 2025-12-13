/**
 * HeroCentered
 * A centered hero section with headline, subheadline, and CTA buttons.
 * Best for: Landing pages, product launches, announcements
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface HeroCenteredProps {
  /** Main headline text */
  headline: string;
  /** Supporting subheadline text */
  subheadline: string;
  /** Primary CTA button text */
  primaryCta: string;
  /** Primary CTA link */
  primaryHref: string;
  /** Secondary CTA button text (optional) */
  secondaryCta?: string;
  /** Secondary CTA link */
  secondaryHref?: string;
  /** Additional CSS classes */
  className?: string;
}

export function HeroCentered({
  headline,
  subheadline,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
  className,
}: HeroCenteredProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden py-20 md:py-32',
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {headline}
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            {subheadline}
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <a href={primaryHref}>
                {primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            {secondaryCta && secondaryHref && (
              <Button size="lg" variant="outline" asChild>
                <a href={secondaryHref}>{secondaryCta}</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Example usage:
// <HeroCentered
//   headline="Ship your SaaS faster than ever"
//   subheadline="The enterprise-grade Next.js boilerplate with authentication, payments, and i18n built-in."
//   primaryCta="Get Started"
//   primaryHref="/signup"
//   secondaryCta="View Demo"
//   secondaryHref="/demo"
// />
