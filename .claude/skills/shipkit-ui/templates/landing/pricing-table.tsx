/**
 * PricingTable
 * A feature comparison table for multiple pricing plans.
 * Best for: Detailed plan comparisons, enterprise pricing pages
 */

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus } from 'lucide-react';

type FeatureValue = boolean | string | 'partial';

interface PlanColumn {
  /** Plan name */
  name: string;
  /** Plan price */
  price: number;
  /** Price suffix */
  priceSuffix?: string;
  /** Is this plan highlighted? */
  popular?: boolean;
  /** CTA button text */
  ctaText: string;
  /** CTA button link */
  ctaHref: string;
}

interface FeatureRow {
  /** Feature category (for grouping) */
  category?: string;
  /** Feature name */
  name: string;
  /** Feature tooltip/description */
  tooltip?: string;
  /** Values for each plan (in order) */
  values: FeatureValue[];
}

interface PricingTableProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Plan columns */
  plans: PlanColumn[];
  /** Feature rows */
  features: FeatureRow[];
  /** Additional CSS classes */
  className?: string;
}

function FeatureCell({ value }: { value: FeatureValue }) {
  if (value === true) {
    return <Check className="mx-auto h-5 w-5 text-primary" />;
  }
  if (value === false) {
    return <X className="mx-auto h-5 w-5 text-muted-foreground/30" />;
  }
  if (value === 'partial') {
    return <Minus className="mx-auto h-5 w-5 text-muted-foreground" />;
  }
  return <span className="text-sm">{value}</span>;
}

export function PricingTable({
  title,
  subtitle,
  plans,
  features,
  className,
}: PricingTableProps) {
  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || 'Features';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, FeatureRow[]>);

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

        {/* Pricing Table */}
        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            {/* Header */}
            <thead>
              <tr>
                <th className="w-1/4 p-4 text-left"></th>
                {plans.map((plan, index) => (
                  <th
                    key={index}
                    className={cn(
                      'w-1/4 p-4 text-center',
                      plan.popular && 'bg-primary/5'
                    )}
                  >
                    <div className="relative">
                      {plan.popular && (
                        <Badge className="absolute -top-6 left-1/2 -translate-x-1/2">
                          Most Popular
                        </Badge>
                      )}
                      <div className="text-lg font-semibold">{plan.name}</div>
                      <div className="mt-2">
                        <span className="text-3xl font-bold">
                          ${plan.price}
                        </span>
                        {plan.priceSuffix && (
                          <span className="text-muted-foreground">
                            {plan.priceSuffix}
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={plan.popular ? 'default' : 'outline'}
                        className="mt-4"
                        asChild
                      >
                        <a href={plan.ctaHref}>{plan.ctaText}</a>
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {Object.entries(groupedFeatures).map(
                ([category, categoryFeatures]) => (
                  <>
                    {/* Category Header */}
                    <tr key={category}>
                      <td
                        colSpan={plans.length + 1}
                        className="border-t bg-muted/30 px-4 py-3"
                      >
                        <span className="font-semibold">{category}</span>
                      </td>
                    </tr>

                    {/* Feature Rows */}
                    {categoryFeatures.map((feature, featureIndex) => (
                      <tr
                        key={`${category}-${featureIndex}`}
                        className="border-t"
                      >
                        <td className="p-4 text-sm">
                          {feature.name}
                          {feature.tooltip && (
                            <span
                              className="ml-1 cursor-help text-muted-foreground"
                              title={feature.tooltip}
                            >
                              (?)
                            </span>
                          )}
                        </td>
                        {feature.values.map((value, valueIndex) => (
                          <td
                            key={valueIndex}
                            className={cn(
                              'p-4 text-center',
                              plans[valueIndex]?.popular && 'bg-primary/5'
                            )}
                          >
                            <FeatureCell value={value} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// Default data for demonstration
export const defaultTablePlans: PlanColumn[] = [
  {
    name: 'Starter',
    price: 199,
    priceSuffix: ' one-time',
    ctaText: 'Get Started',
    ctaHref: '/checkout/starter',
  },
  {
    name: 'Pro',
    price: 349,
    priceSuffix: ' one-time',
    popular: true,
    ctaText: 'Get Pro',
    ctaHref: '/checkout/pro',
  },
  {
    name: 'Enterprise',
    price: 599,
    priceSuffix: ' one-time',
    ctaText: 'Contact Sales',
    ctaHref: '/contact',
  },
];

export const defaultTableFeatures: FeatureRow[] = [
  { category: 'Core Features', name: 'Authentication', values: [true, true, true] },
  { category: 'Core Features', name: 'Payments', values: [true, true, true] },
  { category: 'Core Features', name: 'i18n Support', values: [true, true, true] },
  { category: 'Limits', name: 'Projects', values: ['1', 'Unlimited', 'Unlimited'] },
  { category: 'Limits', name: 'Team seats', values: ['1', '5', 'Unlimited'] },
  { category: 'Support', name: 'Community support', values: [true, true, true] },
  { category: 'Support', name: 'Priority support', values: [false, true, true] },
  { category: 'Support', name: 'Custom onboarding', values: [false, false, true] },
  { category: 'Updates', name: 'Update duration', values: ['6 months', 'Lifetime', 'Lifetime'] },
];

// Example usage:
// <PricingTable
//   title="Compare Plans"
//   subtitle="Choose the perfect plan for your needs"
//   plans={defaultTablePlans}
//   features={defaultTableFeatures}
// />
