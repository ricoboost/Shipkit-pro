'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
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

export interface PainPoint {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export interface ProblemAgitateProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  painPoints: PainPoint[];
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
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5 },
  },
};

export function ProblemAgitate({
  title = "Tired of These Problems?",
  subtitle,
  description,
  painPoints,
  animated = true,
  colorScheme = 'primary',
  className,
}: ProblemAgitateProps) {
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

        <Wrapper className="space-y-6" {...wrapperProps}>
          {painPoints.map((point, index) => (
            <Item
              key={index}
              className="flex items-start gap-4 p-6 rounded-xl border border-destructive/20 bg-destructive/5"
              {...itemProps}
            >
              <div className="flex-shrink-0 p-2 rounded-lg bg-destructive/10 text-destructive">
                {point.icon || <X className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">{point.title}</h3>
                <p className="text-muted-foreground">{point.description}</p>
              </div>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
