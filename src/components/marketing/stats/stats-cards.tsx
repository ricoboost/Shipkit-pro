'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseMarketingProps } from '../types';

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

export interface CardStat {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
}

export interface StatsCardsProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  stats: CardStat[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'bordered' | 'filled';
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4 },
  },
};

export function StatsCards({
  title,
  subtitle,
  description,
  stats,
  columns = 4,
  variant = 'default',
  animated = true,
  colorScheme = 'primary',
  className,
}: StatsCardsProps) {
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
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  const cardStyles = {
    default: 'bg-card border rounded-xl',
    bordered: 'border-2 border-primary/20 rounded-xl',
    filled: 'bg-primary/5 rounded-xl',
  };

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-6xl">
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

        <Wrapper className={cn('grid gap-6', gridCols[columns])} {...wrapperProps}>
          {stats.map((stat, index) => (
            <Item
              key={index}
              className={cn('p-6', cardStyles[variant])}
              {...itemProps}
            >
              <div className="flex items-start justify-between mb-4">
                {stat.icon && (
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {stat.icon}
                  </div>
                )}
                {stat.trend && (
                  <span
                    className={cn(
                      'text-sm font-medium px-2 py-1 rounded-full',
                      stat.trend.positive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {stat.trend.positive ? '+' : ''}
                    {stat.trend.value}
                  </span>
                )}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
              <div className="font-medium text-foreground">{stat.label}</div>
              {stat.description && (
                <p className="mt-2 text-sm text-muted-foreground">{stat.description}</p>
              )}
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
