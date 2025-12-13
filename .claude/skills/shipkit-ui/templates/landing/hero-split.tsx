/**
 * HeroSplit
 * A split hero section with text on left and image/content on right.
 * Best for: Product showcases, feature highlights, SaaS landing pages
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import Image from 'next/image';

interface HeroSplitProps {
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
  /** Secondary CTA link or onClick handler */
  secondaryHref?: string;
  /** Hero image source */
  imageSrc: string;
  /** Hero image alt text */
  imageAlt: string;
  /** Reverse layout (image on left) */
  reversed?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function HeroSplit({
  headline,
  subheadline,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
  imageSrc,
  imageAlt,
  reversed = false,
  className,
}: HeroSplitProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden py-16 md:py-24 lg:py-32',
        className
      )}
    >
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'grid items-center gap-12 lg:grid-cols-2 lg:gap-16',
            reversed && 'lg:[&>*:first-child]:order-2'
          )}
        >
          {/* Text Content */}
          <div className="flex flex-col">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {headline}
            </h1>

            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              {subheadline}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild>
                <a href={primaryHref}>
                  {primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>

              {secondaryCta && secondaryHref && (
                <Button size="lg" variant="ghost" asChild>
                  <a href={secondaryHref}>
                    <Play className="mr-2 h-4 w-4" />
                    {secondaryCta}
                  </a>
                </Button>
              )}
            </div>

            {/* Trust badges (optional) */}
            <div className="mt-8 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span> No credit card required
              </span>
              <span className="flex items-center gap-1">
                <span className="text-green-500">✓</span> 14-day free trial
              </span>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border bg-muted shadow-2xl">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-xl bg-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Example usage:
// <HeroSplit
//   headline="Build your SaaS in days, not months"
//   subheadline="ShipKit Pro gives you everything you need: authentication, payments, i18n, and 149+ components."
//   primaryCta="Start Building"
//   primaryHref="/signup"
//   secondaryCta="Watch Demo"
//   secondaryHref="/demo"
//   imageSrc="/images/dashboard-preview.png"
//   imageAlt="ShipKit Pro Dashboard Preview"
// />
