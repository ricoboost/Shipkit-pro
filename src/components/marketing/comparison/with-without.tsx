'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';
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

export interface WithWithoutProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  withoutTitle?: string;
  withTitle?: string;
  withoutItems: string[];
  withItems: string[];
  productName?: string;
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

export function WithWithout({
  title,
  subtitle,
  description,
  withoutTitle = "Without",
  withTitle = "With",
  withoutItems,
  withItems,
  productName,
  animated = true,
  colorScheme = 'primary',
  className,
}: WithWithoutProps) {
  const Wrapper = animated ? motion.ul : 'ul';
  const Item = animated ? motion.li : 'li';

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

        <div className="grid md:grid-cols-2 gap-8">
          {/* Without column */}
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-destructive">
              <X className="h-6 w-6" />
              {withoutTitle} {productName}
            </h3>
            <Wrapper className="space-y-4" {...wrapperProps}>
              {withoutItems.map((item, index) => (
                <Item
                  key={index}
                  className="flex items-start gap-3"
                  {...itemProps}
                >
                  <X className="h-5 w-5 mt-0.5 text-destructive flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </Item>
              ))}
            </Wrapper>
          </div>

          {/* With column */}
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <h3 className="flex items-center gap-2 text-xl font-bold mb-6 text-primary">
              <Check className="h-6 w-6" />
              {withTitle} {productName}
            </h3>
            <Wrapper className="space-y-4" {...wrapperProps}>
              {withItems.map((item, index) => (
                <Item
                  key={index}
                  className="flex items-start gap-3"
                  {...itemProps}
                >
                  <Check className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
                  <span>{item}</span>
                </Item>
              ))}
            </Wrapper>
          </div>
        </div>
      </div>
    </section>
  );
}
