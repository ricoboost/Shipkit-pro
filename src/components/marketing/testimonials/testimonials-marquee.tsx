'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseMarketingProps, TestimonialItem } from '../types';
import { TestimonialCard } from './testimonial-card';

const sectionVariants = cva('relative py-16 sm:py-20 overflow-hidden', {
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

export interface TestimonialsMarqueeProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  testimonials: TestimonialItem[];
  speed?: 'slow' | 'medium' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  rows?: 1 | 2;
}

const speedClasses = {
  slow: 'animate-[marquee_60s_linear_infinite]',
  medium: 'animate-[marquee_40s_linear_infinite]',
  fast: 'animate-[marquee_25s_linear_infinite]',
};

export function TestimonialsMarquee({
  title,
  subtitle,
  description,
  testimonials,
  speed = 'medium',
  direction = 'left',
  pauseOnHover = true,
  rows = 1,
  colorScheme = 'primary',
  className,
}: TestimonialsMarqueeProps) {
  // Double the testimonials for seamless loop
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  const renderRow = (items: TestimonialItem[], reverse: boolean = false) => (
    <div
      className={cn(
        'flex gap-6 w-max',
        speedClasses[speed],
        reverse && 'animate-[marquee-reverse_40s_linear_infinite]',
        direction === 'right' && !reverse && '[animation-direction:reverse]',
        direction === 'left' && reverse && '[animation-direction:reverse]',
        pauseOnHover && 'hover:[animation-play-state:paused]'
      )}
    >
      {items.map((testimonial, index) => (
        <div key={index} className="w-[350px] flex-shrink-0">
          <TestimonialCard
            {...testimonial}
            colorScheme={colorScheme}
            size="sm"
            showQuoteIcon={false}
          />
        </div>
      ))}
    </div>
  );

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-7xl px-4">
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
      </div>

      {/* Marquee rows */}
      <div className="space-y-6">
        {renderRow(duplicatedTestimonials)}
        {rows === 2 && renderRow(duplicatedTestimonials, true)}
      </div>

      {/* Gradient overlays */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent" />

      {/* Add keyframes via style tag */}
      <style jsx global>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @keyframes marquee-reverse {
          from {
            transform: translateX(-50%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
