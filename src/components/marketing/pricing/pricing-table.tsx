'use client';

import { useState, Fragment } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus } from 'lucide-react';
import Link from 'next/link';
import type { BaseMarketingProps } from '../types';
import { PricingToggle, type BillingPeriod } from './pricing-toggle';

const sectionVariants = cva('relative px-4 py-16 sm:py-20', {
  variants: {
    colorScheme: {
      primary: 'bg-background',
      secondary: 'bg-secondary/10',
      accent: 'bg-accent/10',
      muted: 'bg-muted/50',
      destructive: 'bg-destructive/5',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface PricingPlan {
  name: string;
  description?: string;
  price: {
    monthly: number;
    yearly: number;
  };
  highlighted?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface PricingFeature {
  name: string;
  category?: string;
  values: (boolean | string | null)[];
  tooltip?: string;
}

export interface PricingTableProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  plans: PricingPlan[];
  features: PricingFeature[];
  showToggle?: boolean;
  defaultBillingPeriod?: BillingPeriod;
  highlightedBadge?: string;
  animated?: boolean;
}

export function PricingTable({
  title,
  subtitle,
  description,
  plans,
  features,
  showToggle = true,
  defaultBillingPeriod = 'monthly',
  highlightedBadge = 'Most Popular',
  animated = true,
  colorScheme = 'primary',
  className,
}: PricingTableProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);

  const getPrice = (plan: PricingPlan) => {
    return billingPeriod === 'monthly' ? plan.price.monthly : plan.price.yearly;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const renderValue = (value: boolean | string | null) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-primary mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />;
    }
    if (value === null) {
      return <Minus className="h-5 w-5 text-muted-foreground/30 mx-auto" />;
    }
    return <span className="text-sm">{value}</span>;
  };

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || 'Features';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, PricingFeature[]>);

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-100px' },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle || description) && (
          <div className="mb-12 text-center">
            {subtitle && (
              <p
                className={cn(
                  'mb-2 text-sm font-medium uppercase tracking-wider',
                  colorScheme === 'primary' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        {showToggle && (
          <div className="mb-12">
            <PricingToggle
              value={billingPeriod}
              onChange={setBillingPeriod}
              colorScheme={colorScheme as any}
            />
          </div>
        )}

        <Wrapper className="overflow-x-auto" {...wrapperProps}>
          <table className="w-full border-collapse">
            {/* Header with plan names and prices */}
            <thead>
              <tr>
                <th className="text-left p-4 border-b bg-muted/30 min-w-[200px]" />
                {plans.map((plan) => (
                  <th
                    key={plan.name}
                    className={cn(
                      'p-4 border-b text-center min-w-[180px]',
                      plan.highlighted
                        ? 'bg-primary/5 border-x border-primary/20'
                        : 'bg-muted/30'
                    )}
                  >
                    <div className="relative">
                      {plan.highlighted && (
                        <Badge className="absolute -top-8 left-1/2 -translate-x-1/2">
                          {highlightedBadge}
                        </Badge>
                      )}
                      <div className="font-bold text-lg">{plan.name}</div>
                      {plan.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </div>
                      )}
                      <div className="mt-4">
                        <span className="text-3xl font-bold">
                          {formatPrice(getPrice(plan))}
                        </span>
                        {getPrice(plan) > 0 && (
                          <span className="text-muted-foreground">
                            /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        )}
                      </div>
                      <Button
                        asChild
                        size="sm"
                        variant={plan.highlighted ? 'default' : 'outline'}
                        className="mt-4 w-full"
                      >
                        <Link href={plan.ctaHref || '/register'}>
                          {plan.ctaLabel || 'Get Started'}
                        </Link>
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Feature rows grouped by category */}
            <tbody>
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <Fragment key={category}>
                  <tr>
                    <td
                      colSpan={plans.length + 1}
                      className="p-4 font-semibold text-sm uppercase tracking-wider bg-muted/50 border-y"
                    >
                      {category}
                    </td>
                  </tr>
                  {categoryFeatures.map((feature, index) => (
                    <tr
                      key={`feature-${feature.name}`}
                      className={cn(index % 2 === 0 ? 'bg-background' : 'bg-muted/20')}
                    >
                      <td className="p-4 text-sm border-b">
                        {feature.name}
                      </td>
                      {feature.values.map((value, planIndex) => (
                        <td
                          key={planIndex}
                          className={cn(
                            'p-4 text-center border-b',
                            plans[planIndex]?.highlighted && 'border-x border-primary/20 bg-primary/5'
                          )}
                        >
                          {renderValue(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Wrapper>
      </div>
    </section>
  );
}
