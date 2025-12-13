'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { HeroWithVideoProps } from '../types';

const heroVariants = cva(
  'relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center',
  {
    variants: {
      colorScheme: {
        primary: '',
        secondary: '',
        accent: '',
        muted: '',
        destructive: '',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const overlayVariants = cva(
  'absolute inset-0 z-10',
  {
    variants: {
      colorScheme: {
        primary: 'bg-background/80 dark:bg-background/90',
        secondary: 'bg-secondary/80 dark:bg-secondary/90',
        accent: 'bg-accent/80 dark:bg-accent/90',
        muted: 'bg-muted/80 dark:bg-muted/90',
        destructive: 'bg-destructive/80 dark:bg-destructive/90',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export interface HeroVideoProps
  extends HeroWithVideoProps,
    Omit<VariantProps<typeof heroVariants>, 'colorScheme'> {}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export function HeroVideo({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  video,
  animated = true,
  colorScheme = 'primary',
  className,
}: HeroVideoProps) {
  const Wrapper = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        animate: 'visible',
      }
    : {};

  const itemProps = animated ? { variants: itemVariants } : {};

  return (
    <section className={cn(heroVariants({ colorScheme }), className)}>
      {/* Video Background */}
      {video && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={video.poster}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={video.src} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div className={cn(overlayVariants({ colorScheme }))} />

      {/* Content */}
      <Wrapper className="relative z-20 mx-auto max-w-4xl" {...wrapperProps}>
        {badge && (
          <Item {...itemProps}>
            <Badge
              variant="secondary"
              className="mb-4 bg-background/50 backdrop-blur-sm"
            >
              {badge}
            </Badge>
          </Item>
        )}

        {subtitle && (
          <Item {...itemProps}>
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {subtitle}
            </p>
          </Item>
        )}

        <Item {...itemProps}>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {title}
          </h1>
        </Item>

        {description && (
          <Item {...itemProps}>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              {description}
            </p>
          </Item>
        )}

        {(primaryCTA || secondaryCTA) && (
          <Item {...itemProps}>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
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
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-foreground/20 bg-background/50 backdrop-blur-sm"
                >
                  <Link href={secondaryCTA.href}>{secondaryCTA.label}</Link>
                </Button>
              )}
            </div>
          </Item>
        )}
      </Wrapper>
    </section>
  );
}
