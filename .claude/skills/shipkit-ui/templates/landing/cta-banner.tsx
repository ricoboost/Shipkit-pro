/**
 * CTABanner
 * A full-width banner CTA with gradient background.
 * Best for: Final conversion push, limited-time offers, announcements
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles } from 'lucide-react';

interface CTABannerProps {
  /** Optional badge text */
  badge?: string;
  /** Main headline */
  headline: string;
  /** Supporting description */
  description?: string;
  /** Primary button text */
  primaryCta: string;
  /** Primary button link */
  primaryHref: string;
  /** Secondary text (e.g., "No credit card required") */
  secondaryText?: string;
  /** Gradient variant */
  gradient?: 'purple' | 'blue' | 'green' | 'orange';
  /** Additional CSS classes */
  className?: string;
}

export function CTABanner({
  badge,
  headline,
  description,
  primaryCta,
  primaryHref,
  secondaryText,
  gradient = 'purple',
  className,
}: CTABannerProps) {
  const gradients = {
    purple: 'from-purple-600 via-violet-600 to-indigo-600',
    blue: 'from-blue-600 via-cyan-600 to-teal-600',
    green: 'from-green-600 via-emerald-600 to-teal-600',
    orange: 'from-orange-600 via-amber-600 to-yellow-600',
  };

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        <div
          className={cn(
            'relative overflow-hidden rounded-3xl bg-gradient-to-r p-8 md:p-12 lg:p-16',
            gradients[gradient]
          )}
        >
          {/* Decorative elements */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            {/* Badge */}
            {badge && (
              <Badge
                variant="secondary"
                className="mb-6 bg-white/20 text-white hover:bg-white/30"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                {badge}
              </Badge>
            )}

            {/* Headline */}
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {headline}
            </h2>

            {/* Description */}
            {description && (
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                {description}
              </p>
            )}

            {/* CTA Button */}
            <div className="mt-8">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-gray-900 hover:bg-white/90"
                asChild
              >
                <a href={primaryHref}>
                  {primaryCta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>

            {/* Secondary Text */}
            {secondaryText && (
              <p className="mt-4 text-sm text-white/70">{secondaryText}</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Example usage:
// <CTABanner
//   badge="Limited Time Offer"
//   headline="Start building your SaaS today"
//   description="Get 30% off during our launch week. Join 1,000+ developers already shipping faster."
//   primaryCta="Get Started Now"
//   primaryHref="/signup"
//   secondaryText="No credit card required • 30-day money-back guarantee"
//   gradient="purple"
// />
