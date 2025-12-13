'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { BaseMarketingProps, CTAButton } from '../types';

const ctaVariants = cva(
  'relative px-4 py-16 sm:py-20',
  {
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
  }
);

export interface CTASplitProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof ctaVariants>, 'colorScheme'> {
  title: string;
  description?: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
  image?: {
    src: string;
    alt: string;
  };
  imagePosition?: 'left' | 'right';
  animated?: boolean;
}

const contentVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const imageVariants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const, delay: 0.2 },
  },
};

export function CTASplit({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  image,
  imagePosition = 'right',
  animated = true,
  colorScheme = 'primary',
  className,
}: CTASplitProps) {
  const ContentWrapper = animated ? motion.div : 'div';
  const ImageWrapper = animated ? motion.div : 'div';

  const contentProps = animated
    ? {
        variants: contentVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
      }
    : {};

  const imageProps = animated
    ? {
        variants: imageVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
      }
    : {};

  const content = (
    <ContentWrapper className="flex flex-col justify-center" {...contentProps}>
      <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mb-6 text-lg text-muted-foreground">{description}</p>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link
          href={primaryCTA.href}
          className="inline-flex items-center justify-center rounded-md bg-background px-6 py-3 text-base font-semibold text-foreground shadow-lg transition-colors hover:bg-background/90"
        >
          {primaryCTA.label}
        </Link>
        {secondaryCTA && (
          <Link
            href={secondaryCTA.href}
            className="inline-flex items-center justify-center rounded-md border border-border bg-muted px-6 py-3 text-base font-semibold text-foreground shadow transition-colors hover:bg-muted/80"
          >
            {secondaryCTA.label}
          </Link>
        )}
      </div>
    </ContentWrapper>
  );

  const imageContent = image && (
    <ImageWrapper
      className="relative aspect-video overflow-hidden rounded-2xl"
      {...imageProps}
    >
      <Image src={image.src} alt={image.alt} fill className="object-cover" />
    </ImageWrapper>
  );

  return (
    <section className={cn(ctaVariants({ colorScheme }), className)}>
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        {imagePosition === 'left' ? (
          <>
            {imageContent}
            {content}
          </>
        ) : (
          <>
            {content}
            {imageContent}
          </>
        )}
      </div>
    </section>
  );
}
