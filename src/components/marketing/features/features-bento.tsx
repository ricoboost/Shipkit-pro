'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import type { BaseMarketingProps } from '../types';
import { type ReactNode } from 'react';

const sectionVariants = cva(
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

const cardVariants = cva(
  'group relative overflow-hidden rounded-2xl border p-6 transition-all hover:shadow-xl',
  {
    variants: {
      colorScheme: {
        primary: 'bg-card hover:border-primary/50',
        secondary: 'bg-card hover:border-secondary/50',
        accent: 'bg-card hover:border-accent/50',
        muted: 'bg-background hover:border-muted-foreground/30',
        destructive: 'bg-card hover:border-destructive/50',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const gradientVariants = cva(
  'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100',
  {
    variants: {
      colorScheme: {
        primary: 'bg-gradient-to-br from-primary/10 to-primary/5',
        secondary: 'bg-gradient-to-br from-secondary/20 to-secondary/10',
        accent: 'bg-gradient-to-br from-accent/20 to-accent/10',
        muted: 'bg-gradient-to-br from-muted to-muted/50',
        destructive: 'bg-gradient-to-br from-destructive/10 to-destructive/5',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const iconVariants = cva(
  'flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110',
  {
    variants: {
      colorScheme: {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent/20 text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
        destructive: 'bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

interface BentoItem {
  title: string;
  description: string;
  icon?: ReactNode;
  size?: 'default' | 'large' | 'wide' | 'tall';
  gradient?: string;
}

export interface FeaturesBentoProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  items: BentoItem[];
  animated?: boolean;
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
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function FeaturesBento({
  title,
  subtitle,
  description,
  items,
  animated = true,
  colorScheme = 'primary',
  className,
}: FeaturesBentoProps) {
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

  const sizeClasses = {
    default: '',
    large: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2',
    tall: 'md:row-span-2',
  };

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-7xl">
        {(title || subtitle || description) && (
          <div className="mb-12 text-center">
            {subtitle && (
              <p
                className={cn(
                  'mb-2 text-sm font-medium uppercase tracking-wider',
                  colorScheme === 'primary' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}

        <Wrapper
          className="grid gap-4 md:grid-cols-3 md:auto-rows-[200px]"
          {...wrapperProps}
        >
          {items.map((item, index) => (
            <Item
              key={index}
              className={cn(
                cardVariants({ colorScheme }),
                sizeClasses[item.size || 'default']
              )}
              {...itemProps}
            >
              {/* Background gradient */}
              <div className={cn(gradientVariants({ colorScheme }))} />

              {/* Content */}
              <div className="relative z-10 flex h-full flex-col">
                {item.icon && (
                  <div className={cn(iconVariants({ colorScheme }), 'mb-4')}>
                    {item.icon}
                  </div>
                )}
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
