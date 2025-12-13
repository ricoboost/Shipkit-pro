/**
 * TestimonialsCarousel
 * A swipeable carousel of testimonials.
 * Best for: Featured testimonials, hero sections, mobile-friendly displays
 */

'use client';

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useState } from 'react';

interface Testimonial {
  /** Customer quote */
  quote: string;
  /** Customer name */
  name: string;
  /** Customer role/title */
  role: string;
  /** Customer company */
  company?: string;
  /** Avatar image URL */
  avatarSrc?: string;
}

interface TestimonialsCarouselProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of testimonials */
  testimonials: Testimonial[];
  /** Auto-rotate interval in ms (0 to disable) */
  autoRotate?: number;
  /** Additional CSS classes */
  className?: string;
}

export function TestimonialsCarousel({
  title,
  subtitle,
  testimonials,
  autoRotate = 0,
  className,
}: TestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToPrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        {(title || subtitle) && (
          <div className="mx-auto mb-12 max-w-3xl text-center">
            {title && (
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
            )}
          </div>
        )}

        {/* Carousel */}
        <div className="mx-auto max-w-4xl">
          <div className="relative rounded-2xl border bg-card p-8 md:p-12">
            {/* Quote Icon */}
            <Quote className="absolute left-6 top-6 h-8 w-8 text-primary/20 md:left-8 md:top-8 md:h-12 md:w-12" />

            {/* Testimonial Content */}
            <div className="relative z-10 text-center">
              <blockquote className="text-xl font-medium md:text-2xl lg:text-3xl">
                "{currentTestimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="mt-8 flex flex-col items-center gap-4">
                <Avatar className="h-16 w-16">
                  {currentTestimonial.avatarSrc && (
                    <AvatarImage
                      src={currentTestimonial.avatarSrc}
                      alt={currentTestimonial.name}
                    />
                  )}
                  <AvatarFallback className="text-lg">
                    {currentTestimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{currentTestimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {currentTestimonial.role}
                    {currentTestimonial.company &&
                      ` at ${currentTestimonial.company}`}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 justify-between">
              <Button
                size="icon"
                variant="ghost"
                onClick={goToPrev}
                className="h-10 w-10 rounded-full"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={goToNext}
                className="h-10 w-10 rounded-full"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'w-6 bg-primary'
                    : 'bg-primary/30 hover:bg-primary/50'
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Default testimonials for demonstration
export const defaultCarouselTestimonials: Testimonial[] = [
  {
    quote:
      'ShipKit Pro is the best investment I made for my startup. It literally saved me months of development time and thousands of dollars.',
    name: 'Alex Turner',
    role: 'Founder & CEO',
    company: 'LaunchPad',
    avatarSrc: '/images/testimonials/alex.jpg',
  },
  {
    quote:
      "I've tried 5 different boilerplates before finding ShipKit Pro. The code quality and documentation are on another level.",
    name: 'Priya Patel',
    role: 'Full Stack Developer',
    company: 'TechAgency',
    avatarSrc: '/images/testimonials/priya.jpg',
  },
  {
    quote:
      'The provider abstraction pattern is brilliant. We migrated our entire payment infrastructure in an afternoon.',
    name: 'Michael O\'Brien',
    role: 'Technical Director',
    company: 'SaaS Solutions',
    avatarSrc: '/images/testimonials/michael.jpg',
  },
];

// Example usage:
// <TestimonialsCarousel
//   title="What our customers say"
//   testimonials={defaultCarouselTestimonials}
// />
