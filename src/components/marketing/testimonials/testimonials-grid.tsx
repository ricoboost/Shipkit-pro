'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseMarketingProps, TestimonialItem } from '../types';
import { TestimonialCard } from './testimonial-card';

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

export interface TestimonialsGridProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  testimonials: TestimonialItem[];
  columns?: 2 | 3 | 4;
  masonry?: boolean;
  showRating?: boolean;
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

export function TestimonialsGrid({
  title,
  subtitle,
  description,
  testimonials,
  columns = 3,
  masonry = false,
  showRating = true,
  animated = true,
  colorScheme = 'primary',
  className,
}: TestimonialsGridProps) {
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

        {masonry ? (
          <Wrapper
            className={cn('columns-1 gap-6', gridCols[columns])}
            {...wrapperProps}
          >
            {testimonials.map((testimonial, index) => (
              <Item
                key={index}
                className="mb-6 break-inside-avoid"
                {...itemProps}
              >
                <TestimonialCard
                  {...testimonial}
                  showRating={showRating}
                  colorScheme={colorScheme}
                />
              </Item>
            ))}
          </Wrapper>
        ) : (
          <Wrapper
            className={cn('grid gap-6', gridCols[columns])}
            {...wrapperProps}
          >
            {testimonials.map((testimonial, index) => (
              <Item key={index} {...itemProps}>
                <TestimonialCard
                  {...testimonial}
                  showRating={showRating}
                  colorScheme={colorScheme}
                  className="h-full"
                />
              </Item>
            ))}
          </Wrapper>
        )}
      </div>
    </section>
  );
}
