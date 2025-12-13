'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { HeroProps } from '../types';

const heroVariants = cva(
  'relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center',
  {
    variants: {
      colorScheme: {
        primary: 'bg-background',
        secondary: 'bg-secondary/5',
        accent: 'bg-accent/5',
        muted: 'bg-muted/30',
        destructive: 'bg-destructive/5',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const gradientVariants = cva(
  'absolute inset-0 opacity-30 dark:opacity-20',
  {
    variants: {
      colorScheme: {
        primary:
          'bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.3),transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.2),transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.2),transparent_50%)]',
        secondary:
          'bg-[radial-gradient(ellipse_at_top,hsl(var(--secondary)/0.4),transparent_50%),radial-gradient(ellipse_at_bottom_left,hsl(var(--secondary)/0.3),transparent_50%)]',
        accent:
          'bg-[radial-gradient(ellipse_at_top,hsl(var(--accent)/0.4),transparent_50%),radial-gradient(ellipse_at_bottom_right,hsl(var(--accent)/0.3),transparent_50%)]',
        muted:
          'bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.5),transparent_70%)]',
        destructive:
          'bg-[radial-gradient(ellipse_at_top,hsl(var(--destructive)/0.3),transparent_50%),radial-gradient(ellipse_at_bottom,hsl(var(--destructive)/0.2),transparent_50%)]',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export interface HeroGradientProps
  extends HeroProps,
    Omit<VariantProps<typeof heroVariants>, 'colorScheme'> {}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut' as const,
    },
  },
};

export function HeroGradient({
  title,
  subtitle,
  description,
  primaryCTA,
  secondaryCTA,
  badge,
  animated = true,
  colorScheme = 'primary',
  className,
}: HeroGradientProps) {
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
      {/* Animated gradient background */}
      <div className={cn(gradientVariants({ colorScheme }))} />

      {/* Floating orbs for visual interest */}
      {animated && (
        <>
          <motion.div
            className="absolute left-1/4 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
            variants={floatingVariants}
            animate="animate"
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
            variants={floatingVariants}
            animate="animate"
            style={{ animationDelay: '2s' }}
          />
        </>
      )}

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <Wrapper className="relative z-10 mx-auto max-w-4xl" {...wrapperProps}>
        {badge && (
          <Item {...itemProps}>
            <Badge
              variant="secondary"
              className={cn(
                'mb-4',
                colorScheme === 'primary' && 'bg-primary/10 text-primary'
              )}
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
          <h1 className="mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl lg:text-7xl">
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
                    'shadow-lg',
                    colorScheme === 'primary' &&
                      'bg-primary text-primary-foreground shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30'
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
          </Item>
        )}
      </Wrapper>
    </section>
  );
}
