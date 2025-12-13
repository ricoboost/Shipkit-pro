'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import Link from 'next/link';
import type { BaseMarketingProps, PricingTier } from '../types';
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

const cardVariants = cva(
  'relative flex flex-col rounded-2xl border p-6 transition-all',
  {
    variants: {
      highlighted: {
        true: 'border-primary shadow-xl scale-105 z-10',
        false: 'border-border hover:border-primary/50 hover:shadow-lg',
      },
    },
    defaultVariants: {
      highlighted: false,
    },
  }
);

export interface PricingCardsProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  tiers: PricingTier[];
  showToggle?: boolean;
  defaultBillingPeriod?: BillingPeriod;
  highlightedBadge?: string;
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function PricingCards({
  title,
  subtitle,
  description,
  tiers,
  showToggle = true,
  defaultBillingPeriod = 'monthly',
  highlightedBadge = 'Most Popular',
  animated = true,
  colorScheme = 'primary',
  className,
}: PricingCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);

  const Wrapper = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
      }
    : {};

  const itemProps = animated ? { variants: itemVariants } : {};

  const getPrice = (tier: PricingTier) => {
    return billingPeriod === 'monthly' ? tier.price.monthly : tier.price.yearly;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

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

        <Wrapper
          className="grid gap-8 lg:grid-cols-3"
          {...wrapperProps}
        >
          {tiers.map((tier, index) => (
            <Item
              key={tier.name}
              className={cn(cardVariants({ highlighted: tier.highlighted }))}
              {...itemProps}
            >
              {tier.highlighted && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2"
                  variant="default"
                >
                  {highlightedBadge}
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold">{tier.name}</h3>
                {tier.description && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">
                  {formatPrice(getPrice(tier))}
                </span>
                {getPrice(tier) > 0 && (
                  <span className="text-muted-foreground">
                    /{billingPeriod === 'monthly' ? 'mo' : 'yr'}
                  </span>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                size="lg"
                variant={tier.highlighted ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href={tier.ctaHref || '/register'}>
                  {tier.ctaLabel || 'Get Started'}
                </Link>
              </Button>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
