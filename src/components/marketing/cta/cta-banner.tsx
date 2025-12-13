'use client';

import { motion, type Variants } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { BaseMarketingProps, CTAButton } from '../types';

const bannerVariants = cva(
  'relative w-full px-4 py-3 sm:py-4',
  {
    variants: {
      colorScheme: {
        primary: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        accent: 'bg-accent text-accent-foreground',
        muted: 'bg-muted text-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
      },
      position: {
        top: 'fixed top-0 left-0 right-0 z-50',
        bottom: 'fixed bottom-0 left-0 right-0 z-50',
        inline: 'relative',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
      position: 'inline',
    },
  }
);

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition-colors shadow-md',
  {
    variants: {
      colorScheme: {
        primary: 'bg-background text-foreground hover:bg-background/90',
        secondary: 'bg-background text-foreground hover:bg-background/90',
        accent: 'bg-background text-foreground hover:bg-background/90',
        muted: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-background text-foreground hover:bg-background/90',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export interface CTABannerProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof bannerVariants>, 'colorScheme'> {
  text: string;
  cta: CTAButton;
  dismissible?: boolean;
  position?: 'top' | 'bottom' | 'inline';
  animated?: boolean;
  onDismiss?: () => void;
}

const slideVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

export function CTABanner({
  text,
  cta,
  dismissible = false,
  position = 'inline',
  animated = true,
  colorScheme = 'primary',
  className,
  onDismiss,
}: CTABannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const Wrapper = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: slideVariants,
        initial: 'hidden',
        animate: 'visible',
        exit: 'exit',
      }
    : {};

  return (
    <Wrapper
      className={cn(bannerVariants({ colorScheme, position }), className)}
      {...wrapperProps}
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
        <p className="text-center text-sm font-medium sm:text-left">
          {text}
        </p>

        <div className="flex items-center gap-2">
          <Link
            href={cta.href}
            className={buttonVariants({ colorScheme })}
          >
            {cta.label}
          </Link>

          {dismissible && (
            <button
              onClick={handleDismiss}
              aria-label="Dismiss banner"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </Wrapper>
  );
}
