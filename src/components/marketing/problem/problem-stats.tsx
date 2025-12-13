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

export interface ProblemStat {
  value: string;
  label: string;
  description?: string;
}

export interface ProblemStatsProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  stats: ProblemStat[];
  layout?: 'row' | 'grid';
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5 },
  },
};

export function ProblemStats({
  title,
  subtitle,
  description,
  stats,
  layout = 'row',
  animated = true,
  colorScheme = 'primary',
  className,
}: ProblemStatsProps) {
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
      <div className="mx-auto max-w-5xl">
        {(title || subtitle || description) && (
          <div className="mb-12 text-center">
            {subtitle && (
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-destructive">
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
          className={cn(
            layout === 'row'
              ? 'flex flex-wrap justify-center gap-8 md:gap-16'
              : 'grid grid-cols-2 md:grid-cols-4 gap-8'
          )}
          {...wrapperProps}
        >
          {stats.map((stat, index) => (
            <Item
              key={index}
              className="text-center"
              {...itemProps}
            >
              <div className="text-4xl md:text-5xl font-bold text-destructive mb-2">
                {stat.value}
              </div>
              <div className="font-semibold mb-1">{stat.label}</div>
              {stat.description && (
                <p className="text-sm text-muted-foreground max-w-[200px] mx-auto">
                  {stat.description}
                </p>
              )}
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
