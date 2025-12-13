/**
 * CTASimple
 * A centered call-to-action section.
 * Best for: Page endings, conversion points, newsletter signups
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CTASimpleProps {
  /** Main headline */
  headline: string;
  /** Supporting description */
  description?: string;
  /** Primary button text */
  primaryCta: string;
  /** Primary button link */
  primaryHref: string;
  /** Secondary button text */
  secondaryCta?: string;
  /** Secondary button link */
  secondaryHref?: string;
  /** Background variant */
  variant?: 'default' | 'muted' | 'primary';
  /** Additional CSS classes */
  className?: string;
}

export function CTASimple({
  headline,
  description,
  primaryCta,
  primaryHref,
  secondaryCta,
  secondaryHref,
  variant = 'default',
  className,
}: CTASimpleProps) {
  const variants = {
    default: 'bg-background',
    muted: 'bg-muted/50',
    primary: 'bg-primary text-primary-foreground',
  };

  return (
    <section className={cn('py-16 md:py-24', variants[variant], className)}>
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Headline */}
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            {headline}
          </h2>

          {/* Description */}
          {description && (
            <p
              className={cn(
                'mx-auto mt-4 max-w-xl text-lg',
                variant === 'primary'
                  ? 'text-primary-foreground/80'
                  : 'text-muted-foreground'
              )}
            >
              {description}
            </p>
          )}

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant={variant === 'primary' ? 'secondary' : 'default'}
              asChild
            >
              <a href={primaryHref}>
                {primaryCta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>

            {secondaryCta && secondaryHref && (
              <Button
                size="lg"
                variant={variant === 'primary' ? 'ghost' : 'outline'}
                className={
                  variant === 'primary'
                    ? 'text-primary-foreground hover:bg-primary-foreground/10'
                    : ''
                }
                asChild
              >
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
// <CTASimple
//   headline="Ready to ship faster?"
//   description="Join thousands of developers building with ShipKit Pro."
//   primaryCta="Get Started"
//   primaryHref="/signup"
//   secondaryCta="View Pricing"
//   secondaryHref="/pricing"
//   variant="primary"
// />
