'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import type { BaseMarketingProps, FeatureItem } from '../types';

const sectionVariants = cva(
  'relative px-4 py-16 sm:py-20',
  {
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
  }
);

const iconVariants = cva(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
  {
    variants: {
      colorScheme: {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent/20 text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export interface FeaturesListicleProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  features: FeatureItem[];
  showNumbers?: boolean;
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export function FeaturesListicle({
  title,
  subtitle,
  description,
  features,
  showNumbers = false,
  animated = true,
  colorScheme = 'primary',
  className,
}: FeaturesListicleProps) {
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

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-4xl">
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

        <Wrapper className="space-y-6" {...wrapperProps}>
          {features.map((feature, index) => (
            <Item
              key={index}
              className="flex gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
              {...itemProps}
            >
              <div className={cn(iconVariants({ colorScheme }))}>
                {showNumbers ? (
                  <span className="text-sm font-bold">{index + 1}</span>
                ) : feature.icon ? (
                  feature.icon
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </div>
              <div>
                <h3 className="mb-1 font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
