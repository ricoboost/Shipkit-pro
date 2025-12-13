'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { HeroProps } from '../types';

const heroVariants = cva(
  'relative flex min-h-[60vh] flex-col items-center justify-center px-4 py-16',
  {
    variants: {
      colorScheme: {
        primary: 'bg-background',
        secondary: 'bg-secondary/5',
        accent: 'bg-accent/5',
        muted: 'bg-muted/30',
        destructive: 'bg-destructive/5',
      },
      alignment: {
        center: 'text-center',
        left: 'text-left items-start',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
      alignment: 'center',
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

export interface HeroMinimalProps
  extends HeroProps,
    Omit<VariantProps<typeof heroVariants>, 'colorScheme'> {
  alignment?: 'center' | 'left';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
};

export function HeroMinimal({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  animated = true,
  colorScheme = 'primary',
  alignment = 'center',
  className,
}: HeroMinimalProps) {
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
    <section className={cn(heroVariants({ colorScheme, alignment }), className)}>
      <Wrapper
        className={cn(
          'mx-auto w-full max-w-3xl',
          alignment === 'left' && 'max-w-4xl'
        )}
        {...wrapperProps}
      >
        {subtitle && (
          <Item {...itemProps}>
            <p
              className={cn(
                'mb-3 text-sm font-medium',
                accentVariants({ colorScheme })
              )}
            >
              {subtitle}
            </p>
          </Item>
        )}

        <Item {...itemProps}>
          <h1 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
            {title}
          </h1>
        </Item>

        {description && (
          <Item {...itemProps}>
            <p
              className={cn(
                'mb-6 text-muted-foreground',
                alignment === 'center' && 'mx-auto max-w-xl'
              )}
            >
              {description}
            </p>
          </Item>
        )}

        {(primaryCTA || secondaryCTA) && (
          <Item {...itemProps}>
            <div
              className={cn(
                'flex gap-3',
                alignment === 'center' && 'justify-center'
              )}
            >
              {primaryCTA && (
                <Button
                  asChild
                  className={cn(
                    colorScheme === 'primary' &&
                      'bg-primary text-primary-foreground hover:bg-primary/90'
                  )}
                >
                  <Link href={primaryCTA.href}>{primaryCTA.label}</Link>
                </Button>
              )}
              {secondaryCTA && (
                <Button asChild variant="ghost">
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
