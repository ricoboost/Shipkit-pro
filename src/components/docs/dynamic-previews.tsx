'use client';

/**
 * Dynamic Preview Components
 * Code-split preview components for better bundle performance
 * Each preview is loaded on-demand when used in docs
 */

import dynamic from 'next/dynamic';

// Loading skeleton for preview components
function PreviewSkeleton() {
  return (
    <div className="my-8 rounded-xl border overflow-hidden animate-pulse">
      <div className="h-12 bg-muted/30 border-b flex items-center justify-between px-4">
        <div className="h-4 w-24 bg-muted/50 rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-6 bg-muted/50 rounded" />
          <div className="h-6 w-6 bg-muted/50 rounded" />
        </div>
      </div>
      <div className="h-64 bg-muted/10 flex items-center justify-center">
        <div className="h-8 w-32 bg-muted/30 rounded" />
      </div>
    </div>
  );
}

// ============================================================================
// PRICING PREVIEWS
// ============================================================================

export const PricingCardsPreview = dynamic(
  () => import('./previews/pricing-previews').then((m) => ({ default: m.PricingCardsPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const PricingTablePreview = dynamic(
  () => import('./previews/pricing-previews').then((m) => ({ default: m.PricingTablePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const PricingSinglePreview = dynamic(
  () => import('./previews/pricing-previews').then((m) => ({ default: m.PricingSinglePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// TESTIMONIALS PREVIEWS
// ============================================================================

export const TestimonialCardPreview = dynamic(
  () => import('./previews/testimonials-previews').then((m) => ({ default: m.TestimonialCardPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const TestimonialFeaturedPreview = dynamic(
  () => import('./previews/testimonials-previews').then((m) => ({ default: m.TestimonialFeaturedPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const TestimonialsGridPreview = dynamic(
  () => import('./previews/testimonials-previews').then((m) => ({ default: m.TestimonialsGridPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const TestimonialsCarouselPreview = dynamic(
  () => import('./previews/testimonials-previews').then((m) => ({ default: m.TestimonialsCarouselPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const TestimonialsMarqueePreview = dynamic(
  () => import('./previews/testimonials-previews').then((m) => ({ default: m.TestimonialsMarqueePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// FAQ PREVIEWS
// ============================================================================

export const FAQAccordionPreview = dynamic(
  () => import('./previews/faq-previews').then((m) => ({ default: m.FAQAccordionPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const FAQAccordionBorderedPreview = dynamic(
  () => import('./previews/faq-previews').then((m) => ({ default: m.FAQAccordionBorderedPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const FAQAccordionSeparatedPreview = dynamic(
  () => import('./previews/faq-previews').then((m) => ({ default: m.FAQAccordionSeparatedPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const FAQTwoColumnPreview = dynamic(
  () => import('./previews/faq-previews').then((m) => ({ default: m.FAQTwoColumnPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const FAQCategorizedPreview = dynamic(
  () => import('./previews/faq-previews').then((m) => ({ default: m.FAQCategorizedPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// PROBLEM/SOLUTION PREVIEWS
// ============================================================================

export const ProblemAgitatePreview = dynamic(
  () => import('./previews/problem-previews').then((m) => ({ default: m.ProblemAgitatePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const ProblemSolutionPreview = dynamic(
  () => import('./previews/problem-previews').then((m) => ({ default: m.ProblemSolutionPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const ProblemStatsPreview = dynamic(
  () => import('./previews/problem-previews').then((m) => ({ default: m.ProblemStatsPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// COMPARISON PREVIEWS
// ============================================================================

export const WithWithoutPreview = dynamic(
  () => import('./previews/comparison-previews').then((m) => ({ default: m.WithWithoutPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const ComparisonTablePreview = dynamic(
  () => import('./previews/comparison-previews').then((m) => ({ default: m.ComparisonTablePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// STATS PREVIEWS
// ============================================================================

export const StatsSimplePreview = dynamic(
  () => import('./previews/stats-previews').then((m) => ({ default: m.StatsSimplePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const StatsCardsPreview = dynamic(
  () => import('./previews/stats-previews').then((m) => ({ default: m.StatsCardsPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const StatsAnimatedPreview = dynamic(
  () => import('./previews/stats-previews').then((m) => ({ default: m.StatsAnimatedPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// LOGOS PREVIEWS
// ============================================================================

export const LogoCloudPreview = dynamic(
  () => import('./previews/logos-previews').then((m) => ({ default: m.LogoCloudPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const LogoCloudGrayscalePreview = dynamic(
  () => import('./previews/logos-previews').then((m) => ({ default: m.LogoCloudGrayscalePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const LogoMarqueePreview = dynamic(
  () => import('./previews/logos-previews').then((m) => ({ default: m.LogoMarqueePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const LogoShowcasePreview = dynamic(
  () => import('./previews/logos-previews').then((m) => ({ default: m.LogoShowcasePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// DIVIDERS PREVIEWS
// ============================================================================

export const SectionDividerWavePreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.SectionDividerWavePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const SectionDividerCurvePreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.SectionDividerCurvePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const SectionDividerAnglePreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.SectionDividerAnglePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const SectionDividerAllShapesPreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.SectionDividerAllShapesPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const GradientDividerPreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.GradientDividerPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const AnimatedDividerPreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.AnimatedDividerPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const LineDividerPreview = dynamic(
  () => import('./previews/dividers-previews').then((m) => ({ default: m.LineDividerPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

// ============================================================================
// CTA PREVIEWS
// ============================================================================

export const CTASimplePreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTASimplePreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTASimpleAccentPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTASimpleAccentPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTASimpleMutedPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTASimpleMutedPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTASplitPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTASplitPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTASplitLeftPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTASplitLeftPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTABannerPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTABannerPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTABannerAccentPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTABannerAccentPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTABannerUrgentPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTABannerUrgentPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);

export const CTAFloatingPreview = dynamic(
  () => import('./previews/cta-previews').then((m) => ({ default: m.CTAFloatingPreview })),
  { loading: () => <PreviewSkeleton />, ssr: false }
);
