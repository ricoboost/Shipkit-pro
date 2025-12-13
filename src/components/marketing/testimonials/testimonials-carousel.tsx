'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BaseMarketingProps, TestimonialItem } from '../types';
import { TestimonialCard, TestimonialFeatured } from './testimonial-card';

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

export interface TestimonialsCarouselProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  testimonials: (TestimonialItem & { image?: string })[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showControls?: boolean;
  showDots?: boolean;
  variant?: 'cards' | 'featured';
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export function TestimonialsCarousel({
  title,
  subtitle,
  description,
  testimonials,
  autoPlay = true,
  autoPlayInterval = 5000,
  showControls = true,
  showDots = true,
  variant = 'featured',
  colorScheme = 'primary',
  className,
}: TestimonialsCarouselProps) {
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  const paginate = useCallback(
    (newDirection: number) => {
      const newIndex =
        (currentIndex + newDirection + testimonials.length) % testimonials.length;
      setCurrentIndex([newIndex, newDirection]);
    },
    [currentIndex, testimonials.length]
  );

  const goToSlide = useCallback(
    (index: number) => {
      const direction = index > currentIndex ? 1 : -1;
      setCurrentIndex([index, direction]);
    },
    [currentIndex]
  );

  useEffect(() => {
    if (!autoPlay) return;

    const timer = setInterval(() => {
      paginate(1);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, paginate]);

  const currentTestimonial = testimonials[currentIndex];

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

        <div className="relative">
          {/* Controls */}
          {showControls && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 hidden md:flex"
                onClick={() => paginate(-1)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 hidden md:flex"
                onClick={() => paginate(1)}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Carousel content */}
          <div className="overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
              >
                {variant === 'featured' ? (
                  <TestimonialFeatured
                    {...currentTestimonial}
                    colorScheme={colorScheme}
                  />
                ) : (
                  <TestimonialCard
                    {...currentTestimonial}
                    colorScheme={colorScheme}
                    size="lg"
                    className="max-w-2xl mx-auto"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Dots */}
          {showDots && (
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    index === currentIndex
                      ? 'bg-primary w-6'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Mobile controls */}
          {showControls && (
            <div className="flex justify-center gap-4 mt-6 md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(-1)}
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(1)}
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
