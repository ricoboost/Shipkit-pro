'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { BaseMarketingProps, CTAButton } from '../types';

const floatingVariants = cva(
  'fixed z-50 rounded-xl border p-4 shadow-lg',
  {
    variants: {
      colorScheme: {
        primary: 'bg-card border-primary/20',
        secondary: 'bg-secondary border-secondary-foreground/20',
        accent: 'bg-accent/10 border-accent/30',
        muted: 'bg-muted border-border',
        destructive: 'bg-destructive/10 border-destructive/30',
      },
      position: {
        'bottom-right': 'bottom-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
      position: 'bottom-right',
    },
  }
);

export interface CTAFloatingProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof floatingVariants>, 'colorScheme'> {
  title: string;
  description?: string;
  cta: CTAButton;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  dismissible?: boolean;
  showAfterScroll?: number;
  animated?: boolean;
  onDismiss?: () => void;
}

const slideUpVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: 50,
    scale: 0.95,
    transition: { duration: 0.3, ease: 'easeIn' as const },
  },
};

export function CTAFloating({
  title,
  description,
  cta,
  position = 'bottom-right',
  dismissible = true,
  showAfterScroll = 300,
  animated = true,
  colorScheme = 'primary',
  className,
  onDismiss,
}: CTAFloatingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > showAfterScroll && !isDismissed) {
        setIsVisible(true);
      } else if (window.scrollY <= showAfterScroll) {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, isDismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            floatingVariants({ colorScheme, position }),
            'max-w-sm',
            className
          )}
          variants={animated ? slideUpVariants : undefined}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {dismissible && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute -right-2 -top-2 h-6 w-6 rounded-full border bg-background shadow-sm"
              onClick={handleDismiss}
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </Button>
          )}

          <h3 className="mb-1 font-semibold">{title}</h3>

          {description && (
            <p className="mb-3 text-sm text-muted-foreground">{description}</p>
          )}

          <Button
            asChild
            size="sm"
            className={cn(
              'w-full gap-2',
              colorScheme === 'primary' &&
                'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            <Link href={cta.href}>
              {cta.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
