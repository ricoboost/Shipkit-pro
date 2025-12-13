'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles } from 'lucide-react';
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

const cardVariants = cva(
  'relative rounded-2xl border p-8 md:p-12 transition-all',
  {
    variants: {
      colorScheme: {
        primary: 'border-primary/20 bg-gradient-to-b from-primary/5 to-transparent',
        secondary: 'border-secondary/20 bg-gradient-to-b from-secondary/10 to-transparent',
        accent: 'border-accent/20 bg-gradient-to-b from-accent/10 to-transparent',
        muted: 'border-border bg-card',
        destructive: 'border-destructive/20 bg-gradient-to-b from-destructive/5 to-transparent',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export interface PricingSingleProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  productName: string;
  productDescription?: string;
  price: {
    monthly: number;
    yearly: number;
  };
  originalPrice?: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  bonuses?: string[];
  badge?: string;
  ctaLabel?: string;
  ctaHref?: string;
  guarantee?: string;
  showToggle?: boolean;
  defaultBillingPeriod?: BillingPeriod;
  animated?: boolean;
}

export function PricingSingle({
  title,
  subtitle,
  description,
  productName,
  productDescription,
  price,
  originalPrice,
  features,
  bonuses,
  badge,
  ctaLabel = 'Get Started',
  ctaHref = '/register',
  guarantee,
  showToggle = true,
  defaultBillingPeriod = 'monthly',
  animated = true,
  colorScheme = 'primary',
  className,
}: PricingSingleProps) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>(defaultBillingPeriod);

  const currentPrice = billingPeriod === 'monthly' ? price.monthly : price.yearly;
  const currentOriginalPrice = originalPrice
    ? billingPeriod === 'monthly'
      ? originalPrice.monthly
      : originalPrice.yearly
    : null;

  const formatPrice = (p: number) => {
    if (p === 0) return 'Free';
    return `$${p}`;
  };

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
      <div className="mx-auto max-w-3xl">
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
          <div className="mb-8">
            <PricingToggle
              value={billingPeriod}
              onChange={setBillingPeriod}
              colorScheme={colorScheme as any}
            />
          </div>
        )}

        <Wrapper
          className={cn(cardVariants({ colorScheme }))}
          {...wrapperProps}
        >
          {badge && (
            <Badge
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              variant="default"
            >
              {badge}
            </Badge>
          )}

          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold">{productName}</h3>
            {productDescription && (
              <p className="mt-2 text-muted-foreground">{productDescription}</p>
            )}
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3">
              {currentOriginalPrice && (
                <span className="text-2xl text-muted-foreground line-through">
                  {formatPrice(currentOriginalPrice)}
                </span>
              )}
              <span className="text-5xl font-bold">{formatPrice(currentPrice)}</span>
            </div>
            {currentPrice > 0 && (
              <p className="mt-2 text-muted-foreground">
                per {billingPeriod === 'monthly' ? 'month' : 'year'}
              </p>
            )}
            {currentOriginalPrice && (
              <Badge variant="secondary" className="mt-3">
                Save {Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)}%
              </Badge>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                What&apos;s included
              </h4>
              <ul className="space-y-3">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {bonuses && bonuses.length > 0 && (
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Bonuses
                </h4>
                <ul className="space-y-3">
                  {bonuses.map((bonus, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Sparkles className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                      <span className="text-sm">{bonus}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="text-center">
            <Button asChild size="lg" className="w-full md:w-auto md:px-12">
              <Link href={ctaHref}>{ctaLabel}</Link>
            </Button>

            {guarantee && (
              <p className="mt-4 text-sm text-muted-foreground">{guarantee}</p>
            )}
          </div>
        </Wrapper>
      </div>
    </section>
  );
}
