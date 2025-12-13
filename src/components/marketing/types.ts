import { type ReactNode } from 'react';

export type ColorScheme = 'primary' | 'secondary' | 'accent' | 'muted' | 'destructive';

export interface CTAButton {
  label: string;
  href: string;
  variant?: 'default' | 'outline' | 'ghost';
}

export interface BaseMarketingProps {
  className?: string;
  colorScheme?: ColorScheme;
}

export interface HeroProps extends BaseMarketingProps {
  title: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: CTAButton;
  secondaryCTA?: CTAButton;
  badge?: string;
  animated?: boolean;
}

export interface HeroWithImageProps extends HeroProps {
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export interface HeroWithVideoProps extends HeroProps {
  video?: {
    src: string;
    poster?: string;
  };
}

export interface TestimonialItem {
  content: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: string;
  };
  rating?: number;
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: ReactNode;
}

export interface PricingTier {
  name: string;
  description?: string;
  price: {
    monthly: number;
    yearly: number;
  };
  features: string[];
  highlighted?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface TeamMember {
  name: string;
  role: string;
  image?: string;
  bio?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface StatItem {
  value: string;
  label: string;
  suffix?: string;
  prefix?: string;
}
