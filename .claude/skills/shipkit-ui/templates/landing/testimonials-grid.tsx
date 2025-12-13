/**
 * TestimonialsGrid
 * A grid of testimonial cards with avatars and quotes.
 * Best for: Social proof sections, customer stories
 */

import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

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
  /** Star rating (1-5) */
  rating?: number;
}

interface TestimonialsGridProps {
  /** Section title */
  title: string;
  /** Section subtitle */
  subtitle?: string;
  /** Array of testimonials */
  testimonials: Testimonial[];
  /** Number of columns (2 or 3) */
  columns?: 2 | 3;
  /** Additional CSS classes */
  className?: string;
}

export function TestimonialsGrid({
  title,
  subtitle,
  testimonials,
  columns = 3,
  className,
}: TestimonialsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
  };

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Testimonials Grid */}
        <div className={cn('mt-12 grid gap-6', gridCols[columns])}>
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative flex flex-col rounded-2xl border bg-card p-6"
            >
              {/* Rating Stars */}
              {testimonial.rating && (
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-4 w-4',
                        i < testimonial.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Quote */}
              <blockquote className="flex-1 text-muted-foreground">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {testimonial.avatarSrc && (
                    <AvatarImage
                      src={testimonial.avatarSrc}
                      alt={testimonial.name}
                    />
                  )}
                  <AvatarFallback>
                    {testimonial.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Default testimonials for demonstration
export const defaultTestimonials: Testimonial[] = [
  {
    quote:
      'ShipKit Pro saved me weeks of development time. The authentication and payment integrations just work out of the box.',
    name: 'Sarah Chen',
    role: 'Founder',
    company: 'TechStartup',
    avatarSrc: '/images/testimonials/sarah.jpg',
    rating: 5,
  },
  {
    quote:
      "The provider abstraction is genius. I switched from Stripe to LemonSqueezy in 5 minutes without touching a single line of code.",
    name: 'Marcus Johnson',
    role: 'CTO',
    company: 'SaaS Co',
    avatarSrc: '/images/testimonials/marcus.jpg',
    rating: 5,
  },
  {
    quote:
      'Finally, a boilerplate with proper i18n support. Launching in 7 languages from day one was a game-changer for us.',
    name: 'Emily Rodriguez',
    role: 'Product Manager',
    company: 'GlobalApp',
    avatarSrc: '/images/testimonials/emily.jpg',
    rating: 5,
  },
  {
    quote:
      'The code quality is exceptional. Clean, well-documented, and follows best practices. Worth every penny.',
    name: 'David Kim',
    role: 'Senior Developer',
    company: 'DevStudio',
    avatarSrc: '/images/testimonials/david.jpg',
    rating: 5,
  },
  {
    quote:
      'I built and launched my SaaS in 2 weeks instead of 2 months. The ROI on ShipKit Pro is incredible.',
    name: 'Lisa Thompson',
    role: 'Solo Founder',
    avatarSrc: '/images/testimonials/lisa.jpg',
    rating: 5,
  },
  {
    quote:
      'The multi-tenancy and organization features saved us from building complex architecture. Highly recommended.',
    name: 'James Wilson',
    role: 'Tech Lead',
    company: 'Enterprise Inc',
    avatarSrc: '/images/testimonials/james.jpg',
    rating: 5,
  },
];

// Example usage:
// <TestimonialsGrid
//   title="Loved by developers worldwide"
//   subtitle="Join thousands of developers who ship faster with ShipKit Pro"
//   testimonials={defaultTestimonials}
//   columns={3}
// />
