/**
 * MDX Components for Documentation
 * Preview components are dynamically imported for better bundle performance
 */

import { ComponentPreview, VariantTabs } from './component-preview';

// All preview components are dynamically imported for code-splitting
// This reduces the initial bundle size significantly
import {
  // Pricing
  PricingCardsPreview,
  PricingTablePreview,
  PricingSinglePreview,
  // Testimonials
  TestimonialCardPreview,
  TestimonialFeaturedPreview,
  TestimonialsGridPreview,
  TestimonialsCarouselPreview,
  TestimonialsMarqueePreview,
  // FAQ
  FAQAccordionPreview,
  FAQAccordionBorderedPreview,
  FAQAccordionSeparatedPreview,
  FAQTwoColumnPreview,
  FAQCategorizedPreview,
  // Problem/Solution
  ProblemAgitatePreview,
  ProblemSolutionPreview,
  ProblemStatsPreview,
  // Comparison
  WithWithoutPreview,
  ComparisonTablePreview,
  // Stats
  StatsSimplePreview,
  StatsCardsPreview,
  StatsAnimatedPreview,
  // Logos
  LogoCloudPreview,
  LogoCloudGrayscalePreview,
  LogoMarqueePreview,
  LogoShowcasePreview,
  // Dividers
  SectionDividerWavePreview,
  SectionDividerCurvePreview,
  SectionDividerAnglePreview,
  SectionDividerAllShapesPreview,
  GradientDividerPreview,
  AnimatedDividerPreview,
  LineDividerPreview,
  // CTA
  CTASimplePreview,
  CTASimpleAccentPreview,
  CTASimpleMutedPreview,
  CTASplitPreview,
  CTASplitLeftPreview,
  CTABannerPreview,
  CTABannerAccentPreview,
  CTABannerUrgentPreview,
  CTAFloatingPreview,
} from './dynamic-previews';

// Export all components for MDX usage
export const docsComponents = {
  // Wrapper components
  ComponentPreview,
  VariantTabs,

  // Pricing
  PricingCardsPreview,
  PricingTablePreview,
  PricingSinglePreview,

  // Testimonials
  TestimonialCardPreview,
  TestimonialFeaturedPreview,
  TestimonialsGridPreview,
  TestimonialsCarouselPreview,
  TestimonialsMarqueePreview,

  // FAQ
  FAQAccordionPreview,
  FAQAccordionBorderedPreview,
  FAQAccordionSeparatedPreview,
  FAQTwoColumnPreview,
  FAQCategorizedPreview,

  // Problem/Solution
  ProblemAgitatePreview,
  ProblemSolutionPreview,
  ProblemStatsPreview,

  // Comparison
  WithWithoutPreview,
  ComparisonTablePreview,

  // Stats
  StatsSimplePreview,
  StatsCardsPreview,
  StatsAnimatedPreview,

  // Logos
  LogoCloudPreview,
  LogoCloudGrayscalePreview,
  LogoMarqueePreview,
  LogoShowcasePreview,

  // Dividers
  SectionDividerWavePreview,
  SectionDividerCurvePreview,
  SectionDividerAnglePreview,
  SectionDividerAllShapesPreview,
  GradientDividerPreview,
  AnimatedDividerPreview,
  LineDividerPreview,

  // CTA
  CTASimplePreview,
  CTASimpleAccentPreview,
  CTASimpleMutedPreview,
  CTASplitPreview,
  CTASplitLeftPreview,
  CTABannerPreview,
  CTABannerAccentPreview,
  CTABannerUrgentPreview,
  CTAFloatingPreview,
};
