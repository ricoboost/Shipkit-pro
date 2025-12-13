'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseMarketingProps, FeatureItem } from '../types';
import { type ReactNode } from 'react';

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

const cardVariants = cva(
  'rounded-xl border p-6 transition-all hover:shadow-lg',
  {
    variants: {
      colorScheme: {
        primary: 'bg-card hover:border-primary/50 hover:shadow-primary/5',
        secondary: 'bg-card hover:border-secondary/50 hover:shadow-secondary/5',
        accent: 'bg-card hover:border-accent/50 hover:shadow-accent/5',
        muted: 'bg-background hover:border-muted-foreground/30',
        destructive: 'bg-card hover:border-destructive/50 hover:shadow-destructive/5',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const iconVariants = cva(
  'mb-4 flex h-12 w-12 items-center justify-center rounded-lg',
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

export interface FeaturesGridProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  features: FeatureItem[];
  columns?: 2 | 3 | 4;
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

export function FeaturesGrid({
  title,
  subtitle,
  description,
  features,
  columns = 3,
  animated = true,
  colorScheme = 'primary',
  className,
}: FeaturesGridProps) {
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

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
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

        <Wrapper
          className={cn('grid gap-6', gridCols[columns])}
          {...wrapperProps}
        >
          {features.map((feature, index) => (
            <Item
              key={index}
              className={cn(cardVariants({ colorScheme }))}
              {...itemProps}
            >
              {feature.icon && (
                <div className={cn(iconVariants({ colorScheme }))}>
                  {feature.icon}
                </div>
              )}
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
