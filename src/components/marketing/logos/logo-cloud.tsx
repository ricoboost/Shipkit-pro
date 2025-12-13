'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { BaseMarketingProps } from '../types';

const sectionVariants = cva('relative px-4 py-12 sm:py-16', {
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
});

export interface Logo {
  name: string;
  src: string;
  href?: string;
  width?: number;
  height?: number;
}

export interface LogoCloudProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  logos: Logo[];
  variant?: 'default' | 'grayscale' | 'bordered';
  size?: 'sm' | 'md' | 'lg';
  columns?: 3 | 4 | 5 | 6;
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export function LogoCloud({
  title,
  subtitle,
  logos,
  variant = 'default',
  size = 'md',
  columns = 6,
  animated = true,
  colorScheme = 'primary',
  className,
}: LogoCloudProps) {
  const Wrapper = animated ? motion.div : 'div';
  const Item = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-50px' },
      }
    : {};

  const itemProps = animated ? { variants: itemVariants } : {};

  const gridCols = {
    3: 'grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-4',
    5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6',
  };

  const sizes = {
    sm: { width: 100, height: 32 },
    md: { width: 140, height: 40 },
    lg: { width: 180, height: 48 },
  };

  const LogoWrapper = ({ logo, children }: { logo: Logo; children: React.ReactNode }) => {
    if (logo.href) {
      return (
        <a
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block transition-transform hover:scale-105"
          aria-label={logo.name}
        >
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-5xl">
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {subtitle && (
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
            )}
          </div>
        )}

        <Wrapper
          className={cn('grid gap-8 items-center justify-items-center', gridCols[columns])}
          {...wrapperProps}
        >
          {logos.map((logo, index) => (
            <Item
              key={index}
              className={cn(
                'flex items-center justify-center',
                variant === 'bordered' && 'p-4 rounded-lg border bg-card',
                variant === 'grayscale' && 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all'
              )}
              {...itemProps}
            >
              <LogoWrapper logo={logo}>
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={logo.width || sizes[size].width}
                  height={logo.height || sizes[size].height}
                  className="h-auto w-auto max-h-10 object-contain"
                />
              </LogoWrapper>
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
