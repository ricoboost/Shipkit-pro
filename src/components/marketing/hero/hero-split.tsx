'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import type { HeroWithImageProps } from '../types';

const heroVariants = cva(
  'relative grid min-h-[70vh] items-center gap-8 px-4 py-20 lg:grid-cols-2 lg:gap-12',
  {
    variants: {
      colorScheme: {
        primary: 'bg-background',
        secondary: 'bg-secondary/10',
        accent: 'bg-accent/10',
        muted: 'bg-muted/50',
        destructive: 'bg-destructive/5',
      },
      imagePosition: {
        left: '',
        right: '',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
      imagePosition: 'right',
    },
  }
);

const accentVariants = cva('', {
  variants: {
    colorScheme: {
      primary: 'text-primary',
      secondary: 'text-secondary-foreground',
      accent: 'text-accent-foreground',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface HeroSplitProps
  extends HeroWithImageProps,
    Omit<VariantProps<typeof heroVariants>, 'colorScheme'> {
  imagePosition?: 'left' | 'right';
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

export function HeroSplit({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  image,
  imagePosition = 'right',
  animated = true,
  colorScheme = 'primary',
  className,
}: HeroSplitProps) {
  const ContentWrapper = animated ? motion.div : 'div';
  const ImageWrapper = animated ? motion.div : 'div';

  const contentProps = animated
    ? {
        variants: contentVariants,
        initial: 'hidden',
        animate: 'visible',
      }
    : {};

  const imageProps = animated
    ? {
        variants: imageVariants,
        initial: 'hidden',
        animate: 'visible',
      }
    : {};

  const content = (
    <ContentWrapper className="flex flex-col justify-center" {...contentProps}>
      {badge && (
        <Badge
          variant="secondary"
          className={cn(
            'mb-4 w-fit',
            colorScheme === 'primary' && 'bg-primary/10 text-primary'
          )}
        >
          {badge}
        </Badge>
      )}

      {subtitle && (
        <p
          className={cn(
            'mb-4 text-sm font-medium uppercase tracking-wider',
            accentVariants({ colorScheme })
          )}
        >
          {subtitle}
        </p>
      )}

      <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
        {title}
      </h1>

      {description && (
        <p className="mb-8 max-w-lg text-lg text-muted-foreground">
          {description}
        </p>
      )}

      {(primaryCTA || secondaryCTA) && (
        <div className="flex flex-col gap-4 sm:flex-row">
          {primaryCTA && (
            <Button
              asChild
              size="lg"
              className={cn(
                colorScheme === 'primary' &&
                  'bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              <Link href={primaryCTA.href}>{primaryCTA.label}</Link>
            </Button>
          )}
          {secondaryCTA && (
            <Button asChild variant="outline" size="lg">
              <Link href={secondaryCTA.href}>{secondaryCTA.label}</Link>
            </Button>
          )}
        </div>
      )}
    </ContentWrapper>
  );

  const imageContent = image && (
    <ImageWrapper
      className="relative aspect-square overflow-hidden rounded-2xl lg:aspect-[4/3]"
      {...imageProps}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        className="object-cover"
        priority
      />
    </ImageWrapper>
  );

  return (
    <section
      className={cn(
        heroVariants({ colorScheme }),
        'mx-auto max-w-7xl',
        className
      )}
    >
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
    </section>
  );
}
