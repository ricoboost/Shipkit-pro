'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseMarketingProps, FAQItem } from '../types';

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

const questionVariants = cva('font-semibold mb-2', {
  variants: {
    colorScheme: {
      primary: 'text-foreground',
      secondary: 'text-secondary-foreground',
      accent: 'text-accent-foreground',
      muted: 'text-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface FAQTwoColumnProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  items: FAQItem[];
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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function FAQTwoColumn({
  title,
  subtitle,
  description,
  items,
  animated = true,
  colorScheme = 'primary',
  className,
}: FAQTwoColumnProps) {
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

  // Split items into two columns
  const midpoint = Math.ceil(items.length / 2);
  const leftColumn = items.slice(0, midpoint);
  const rightColumn = items.slice(midpoint);

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

        <Wrapper
          className="grid gap-8 md:grid-cols-2"
          {...wrapperProps}
        >
          <div className="space-y-8">
            {leftColumn.map((item, index) => (
              <Item key={index} {...itemProps}>
                <h3 className={questionVariants({ colorScheme })}>
                  {item.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </Item>
            ))}
          </div>
          <div className="space-y-8">
            {rightColumn.map((item, index) => (
              <Item key={index + midpoint} {...itemProps}>
                <h3 className={questionVariants({ colorScheme })}>
                  {item.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </p>
              </Item>
            ))}
          </div>
        </Wrapper>
      </div>
    </section>
  );
}
