'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { BaseMarketingProps, CTAButton } from '../types';

const ctaVariants = cva(
  'relative px-4 py-16 sm:py-20',
  {
    variants: {
      colorScheme: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent text-accent-foreground',
        muted: 'bg-muted text-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const buttonVariants = cva('shadow-lg', {
  variants: {
    colorScheme: {
      primary: 'bg-background text-foreground hover:bg-background/90',
      secondary: 'bg-background text-foreground hover:bg-background/90',
      accent: 'bg-background text-foreground hover:bg-background/90',
      muted: 'bg-background text-foreground hover:bg-background/90',
      destructive: 'bg-background text-foreground hover:bg-background/90',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

const secondaryButtonVariants = cva('shadow', {
  variants: {
    colorScheme: {
      primary: 'bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted',
      secondary: 'bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted',
      accent: 'bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted',
      muted: 'bg-muted text-muted-foreground border border-muted-foreground/20 hover:bg-muted/80',
      destructive: 'bg-muted/80 text-muted-foreground border border-muted-foreground/20 hover:bg-muted',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface CTASimpleProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof ctaVariants>, 'colorScheme'> {
  title: string;
  description?: string;
  primaryCTA: CTAButton;
  secondaryCTA?: CTAButton;
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function CTASimple({
  title,
  description,
  primaryCTA,
  secondaryCTA,
  animated = true,
  colorScheme = 'primary',
  className,
}: CTASimpleProps) {
  const Wrapper = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
      }
    : {};

  const itemProps = animated ? { variants: itemVariants } : {};

  return (
    <section className={cn(ctaVariants({ colorScheme }), className)}>
      <Wrapper
        className="mx-auto max-w-4xl text-center"
        {...wrapperProps}
      >
        <Item {...itemProps}>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
        </Item>

        {description && (
          <Item {...itemProps}>
            <p className="mx-auto mb-8 max-w-2xl text-lg opacity-90">
              {description}
            </p>
          </Item>
        )}

        <Item {...itemProps}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={primaryCTA.href}
              className={cn(
                'inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors',
                buttonVariants({ colorScheme })
              )}
            >
              {primaryCTA.label}
            </Link>
            {secondaryCTA && (
              <Link
                href={secondaryCTA.href}
                className={cn(
                  'inline-flex items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors',
                  secondaryButtonVariants({ colorScheme })
                )}
              >
                {secondaryCTA.label}
              </Link>
            )}
          </div>
        </Item>
      </Wrapper>
    </section>
  );
}
