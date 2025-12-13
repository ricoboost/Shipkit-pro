'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { HeroProps } from '../types';

const heroVariants = cva(
  'relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center',
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

const badgeVariants = cva('mb-4', {
  variants: {
    colorScheme: {
      primary: 'bg-primary/10 text-primary hover:bg-primary/20',
      secondary: 'bg-secondary text-secondary-foreground',
      accent: 'bg-accent text-accent-foreground',
      muted: 'bg-muted text-muted-foreground',
      destructive: 'bg-destructive/10 text-destructive',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

const buttonVariants = cva('', {
  variants: {
    colorScheme: {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
      accent: 'bg-accent text-accent-foreground hover:bg-accent/90',
      muted: 'bg-muted text-muted-foreground hover:bg-muted/90',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface HeroCenteredProps
  extends HeroProps,
    Omit<VariantProps<typeof heroVariants>, 'colorScheme'> {}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
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

export function HeroCentered({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  animated = true,
  colorScheme = 'primary',
  className,
}: HeroCenteredProps) {
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
      <Wrapper
        className="mx-auto max-w-4xl"
        {...wrapperProps}
      >
        {badge && (
          <Item {...itemProps}>
            <Badge
              variant="secondary"
              className={cn(badgeVariants({ colorScheme }))}
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
                  className={cn(buttonVariants({ colorScheme }))}
                >
                  <Link href={primaryCTA.href}>{primaryCTA.label}</Link>
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
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
