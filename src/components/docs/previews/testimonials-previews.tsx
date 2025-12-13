'use client';

import { TestimonialCard, TestimonialFeatured } from '@/components/marketing/testimonials/testimonial-card';
import { TestimonialsGrid } from '@/components/marketing/testimonials/testimonials-grid';
import { TestimonialsCarousel } from '@/components/marketing/testimonials/testimonials-carousel';
import { TestimonialsMarquee } from '@/components/marketing/testimonials/testimonials-marquee';
import { sampleTestimonials } from './sample-data';

export function TestimonialCardPreview() {
  const t = sampleTestimonials[0];
  return (
    <div className="max-w-md mx-auto">
      <TestimonialCard
        content={t.content}
        author={t.author}
        rating={t.rating}
      />
    </div>
  );
}

export function TestimonialFeaturedPreview() {
  const t = sampleTestimonials[0];
  return (
    <TestimonialFeatured
      content={t.content}
      author={t.author}
      rating={t.rating}
    />
  );
}

export function TestimonialsGridPreview() {
  return (
    <TestimonialsGrid
      subtitle="What Our Customers Say"
      title="Loved by Developers"
      description="Join thousands of developers who trust ShipKit."
      testimonials={sampleTestimonials}
      columns={2}
    />
  );
}

export function TestimonialsCarouselPreview() {
  return (
    <TestimonialsCarousel
      subtitle="Customer Reviews"
      title="What People Say"
      testimonials={sampleTestimonials}
    />
  );
}

export function TestimonialsMarqueePreview() {
  return (
    <TestimonialsMarquee
      title="Trusted by Thousands"
      testimonials={sampleTestimonials}
      speed="medium"
    />
  );
}
