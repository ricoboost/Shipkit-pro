/**
 * TestimonialsMarquee
 * An infinite scrolling marquee of testimonials.
 * Best for: Social proof sections, building trust, visual impact
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
  /** Avatar image URL */
  avatarSrc?: string;
  /** Star rating (1-5) */
  rating?: number;
}

interface TestimonialsMarqueeProps {
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** First row of testimonials */
  rowOne: Testimonial[];
  /** Second row of testimonials (scrolls opposite direction) */
  rowTwo?: Testimonial[];
  /** Animation duration in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="mx-3 w-[350px] flex-shrink-0 rounded-xl border bg-card p-6">
      {/* Rating */}
      {testimonial.rating && (
        <div className="mb-3 flex gap-0.5">
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
      <p className="text-sm text-muted-foreground">"{testimonial.quote}"</p>

      {/* Author */}
      <div className="mt-4 flex items-center gap-3">
        <Avatar className="h-8 w-8">
          {testimonial.avatarSrc && (
            <AvatarImage src={testimonial.avatarSrc} alt={testimonial.name} />
          )}
          <AvatarFallback className="text-xs">
            {testimonial.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="text-sm font-medium">{testimonial.name}</div>
          <div className="text-xs text-muted-foreground">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsMarquee({
  title,
  subtitle,
  rowOne,
  rowTwo,
  duration = 40,
  className,
}: TestimonialsMarqueeProps) {
  // Duplicate items for seamless loop
  const duplicatedRowOne = [...rowOne, ...rowOne];
  const duplicatedRowTwo = rowTwo ? [...rowTwo, ...rowTwo] : [];

  return (
    <section className={cn('py-16 md:py-24 overflow-hidden', className)}>
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
      </div>

      {/* Marquee Container */}
      <div className="space-y-6">
        {/* Row One - Scrolls Left */}
        <div className="relative">
          <div
            className="flex animate-marquee"
            style={{
              animationDuration: `${duration}s`,
            }}
          >
            {duplicatedRowOne.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>

          {/* Gradient Overlays */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
        </div>

        {/* Row Two - Scrolls Right (optional) */}
        {duplicatedRowTwo.length > 0 && (
          <div className="relative">
            <div
              className="flex animate-marquee-reverse"
              style={{
                animationDuration: `${duration}s`,
              }}
            >
              {duplicatedRowTwo.map((testimonial, index) => (
                <TestimonialCard key={index} testimonial={testimonial} />
              ))}
            </div>

            {/* Gradient Overlays */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-background to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-background to-transparent" />
          </div>
        )}
      </div>

      {/* Add these keyframes to your global CSS or tailwind.config.js:
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
        .animate-marquee {
          animation: marquee linear infinite;
        }
        .animate-marquee-reverse {
          animation: marquee-reverse linear infinite;
        }
      */}
    </section>
  );
}

// Default testimonials for demonstration
export const defaultMarqueeTestimonials = {
  rowOne: [
    {
      quote: 'ShipKit Pro saved me weeks of development time.',
      name: 'Sarah Chen',
      role: 'Founder at TechStartup',
      rating: 5,
    },
    {
      quote: 'The best Next.js boilerplate I\'ve ever used.',
      name: 'Marcus Johnson',
      role: 'CTO at SaaS Co',
      rating: 5,
    },
    {
      quote: 'Provider abstraction is a game-changer.',
      name: 'Emily Rodriguez',
      role: 'Developer at GlobalApp',
      rating: 5,
    },
    {
      quote: 'Launched my SaaS in 2 weeks instead of 2 months.',
      name: 'David Kim',
      role: 'Solo Founder',
      rating: 5,
    },
  ],
  rowTwo: [
    {
      quote: 'The code quality is exceptional.',
      name: 'Lisa Thompson',
      role: 'Tech Lead at Enterprise Inc',
      rating: 5,
    },
    {
      quote: 'Worth every penny. Incredible ROI.',
      name: 'James Wilson',
      role: 'Founder at StartupX',
      rating: 5,
    },
    {
      quote: 'Finally, proper i18n support out of the box.',
      name: 'Priya Patel',
      role: 'Product Manager',
      rating: 5,
    },
    {
      quote: 'Multi-tenancy features saved us months.',
      name: 'Alex Turner',
      role: 'CTO at AgencyPro',
      rating: 5,
    },
  ],
};

// Example usage:
// <TestimonialsMarquee
//   title="Trusted by developers worldwide"
//   rowOne={defaultMarqueeTestimonials.rowOne}
//   rowTwo={defaultMarqueeTestimonials.rowTwo}
//   duration={40}
// />
