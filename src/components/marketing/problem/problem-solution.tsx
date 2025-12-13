'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, ArrowRight, Check } from 'lucide-react';
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

export interface ProblemSolutionItem {
  before: string;
  after: string;
}

export interface ProblemSolutionProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  beforeTitle?: string;
  afterTitle?: string;
  items: ProblemSolutionItem[];
  solutionName?: string;
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function ProblemSolution({
  title = "The Transformation",
  subtitle,
  description,
  beforeTitle = "Before",
  afterTitle = "After",
  items,
  solutionName,
  animated = true,
  colorScheme = 'primary',
  className,
}: ProblemSolutionProps) {
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

        {/* Header labels */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 mb-6 px-4">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive font-medium text-sm">
              <X className="h-4 w-4" />
              {beforeTitle}
            </span>
          </div>
          <div className="flex items-center justify-center">
            {solutionName && (
              <span className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm">
                {solutionName}
              </span>
            )}
          </div>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Check className="h-4 w-4" />
              {afterTitle}
            </span>
          </div>
        </div>

        <Wrapper className="space-y-4" {...wrapperProps}>
          {items.map((item, index) => (
            <Item
              key={index}
              className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center"
              {...itemProps}
            >
              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 text-center">
                <p className="text-muted-foreground">{item.before}</p>
              </div>
              <div className="flex items-center justify-center">
                <ArrowRight className="h-6 w-6 text-primary" />
              </div>
              <div className="p-4 rounded-lg border border-primary/20 bg-primary/5 text-center">
                <p>{item.after}</p>
              </div>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
