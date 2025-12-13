'use client';

/**
 * Tip Block
 * Info or warning tip with icon
 */

import { Lightbulb, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type TipVariant = 'info' | 'warning' | 'tip';

interface TipBlockProps {
  children: React.ReactNode;
  variant?: TipVariant;
  className?: string;
}

const variantStyles: Record<
  TipVariant,
  { bg: string; border: string; icon: string; text: string }
> = {
  tip: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-200',
  },
  warning: {
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    border: 'border-orange-200 dark:border-orange-900',
    icon: 'text-orange-600 dark:text-orange-400',
    text: 'text-orange-800 dark:text-orange-200',
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    border: 'border-blue-200 dark:border-blue-900',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-800 dark:text-blue-200',
  },
};

const variantIcons = {
  tip: Lightbulb,
  warning: AlertTriangle,
  info: Info,
};

export function TipBlock({
  children,
  variant = 'tip',
  className,
}: TipBlockProps) {
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-xl border',
        styles.bg,
        styles.border,
        className
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', styles.icon)} />
      <div className={cn('text-sm', styles.text)}>{children}</div>
    </div>
  );
}
