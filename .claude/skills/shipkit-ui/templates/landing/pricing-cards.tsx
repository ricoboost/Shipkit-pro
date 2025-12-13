/**
 * PricingCards
 * Side-by-side pricing cards with feature lists.
 * Best for: SaaS pricing pages, plan comparisons
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

interface PricingFeature {
  /** Feature text */
  text: string;
  /** Is this feature included? */
  included: boolean;
}

interface PricingPlan {
  /** Plan name */
  name: string;
  /** Plan description */
  description: string;
  /** Price amount */
  price: number;
  /** Price suffix (e.g., "/month", "/year", "one-time") */
  priceSuffix?: string;
  /** Original price for showing discount */
  originalPrice?: number;
  /** List of features */
  features: PricingFeature[];
  /** CTA button text */
  ctaText: string;
  /** CTA button link */
  ctaHref: string;
  /** Is this the highlighted/popular plan? */
  popular?: boolean;
  /** Badge text (e.g., "Most Popular", "Best Value") */
  badge?: string;
}

interface PricingCardsProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of pricing plans */
  plans: PricingPlan[];
  /** Additional CSS classes */
  className?: string;
}

export function PricingCards({
  title,
  subtitle,
  plans,
  className,
}: PricingCardsProps) {
  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-card p-8',
                plan.popular &&
                  'border-primary shadow-lg ring-1 ring-primary'
              )}
            >
              {/* Badge */}
              {plan.badge && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  variant={plan.popular ? 'default' : 'secondary'}
                >
                  {plan.badge}
                </Badge>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  {plan.originalPrice && (
                    <span className="text-2xl text-muted-foreground line-through">
                      ${plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.priceSuffix && (
                    <span className="text-muted-foreground">
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                    ) : (
                      <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground/50" />
                    )}
                    <span
                      className={cn(
                        'text-sm',
                        !feature.included && 'text-muted-foreground/50'
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                size="lg"
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full"
                asChild
              >
                <a href={plan.ctaHref}>{plan.ctaText}</a>
              </Button>
            </div>
          ))}
        </div>

        {/* Money-back guarantee */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          30-day money-back guarantee. No questions asked.
        </p>
      </div>
    </section>
  );
}

// Default plans for demonstration
export const defaultPricingPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for side projects',
    price: 199,
    priceSuffix: 'one-time',
    features: [
      { text: 'All core features', included: true },
      { text: '1 project license', included: true },
      { text: 'Community support', included: true },
      { text: '6 months updates', included: true },
      { text: 'Priority support', included: false },
      { text: 'Custom onboarding', included: false },
    ],
    ctaText: 'Get Starter',
    ctaHref: '/checkout/starter',
  },
  {
    name: 'Pro',
    description: 'For serious builders',
    price: 349,
    priceSuffix: 'one-time',
    originalPrice: 499,
    popular: true,
    badge: 'Most Popular',
    features: [
      { text: 'All core features', included: true },
      { text: 'Unlimited projects', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Lifetime updates', included: true },
      { text: 'Discord community access', included: true },
      { text: 'Custom onboarding', included: false },
    ],
    ctaText: 'Get Pro',
    ctaHref: '/checkout/pro',
  },
  {
    name: 'Enterprise',
    description: 'For teams and agencies',
    price: 599,
    priceSuffix: 'one-time',
    features: [
      { text: 'All Pro features', included: true },
      { text: 'Unlimited team seats', included: true },
      { text: 'Priority support (24h)', included: true },
      { text: 'Custom onboarding call', included: true },
      { text: 'White-label rights', included: true },
      { text: 'Custom feature requests', included: true },
    ],
    ctaText: 'Contact Sales',
    ctaHref: '/contact',
  },
];

// Example usage:
// <PricingCards
//   title="Simple, transparent pricing"
//   subtitle="Choose the plan that fits your needs. All plans include a 30-day money-back guarantee."
//   plans={defaultPricingPlans}
// />
