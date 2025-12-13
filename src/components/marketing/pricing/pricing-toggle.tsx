'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const toggleVariants = cva(
  'relative inline-flex items-center rounded-full p-1 transition-colors',
  {
    variants: {
      colorScheme: {
        primary: 'bg-muted',
        secondary: 'bg-secondary/20',
        accent: 'bg-accent/20',
        muted: 'bg-muted/50',
        destructive: 'bg-destructive/10',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const buttonVariants = cva(
  'relative z-10 px-4 py-2 text-sm font-medium rounded-full transition-colors',
  {
    variants: {
      active: {
        true: 'text-primary-foreground',
        false: 'text-muted-foreground hover:text-foreground',
      },
    },
  }
);

const indicatorVariants = cva(
  'absolute top-1 bottom-1 rounded-full transition-all duration-300 ease-out',
  {
    variants: {
      colorScheme: {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        accent: 'bg-accent',
        muted: 'bg-foreground',
        destructive: 'bg-destructive',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export type BillingPeriod = 'monthly' | 'yearly';

export interface PricingToggleProps extends VariantProps<typeof toggleVariants> {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  monthlyLabel?: string;
  yearlyLabel?: string;
  savingsLabel?: string;
  savingsPercentage?: number;
  className?: string;
}

export function PricingToggle({
  value,
  onChange,
  monthlyLabel = 'Monthly',
  yearlyLabel = 'Yearly',
  savingsLabel = 'Save',
  savingsPercentage = 20,
  colorScheme = 'primary',
  className,
}: PricingToggleProps) {
  const isYearly = value === 'yearly';

  return (
    <div className={cn('flex items-center justify-center gap-3', className)}>
      <div className={cn(toggleVariants({ colorScheme }))}>
        <div
          className={cn(
            indicatorVariants({ colorScheme }),
            isYearly ? 'left-1/2 right-1' : 'left-1 right-1/2'
          )}
        />
        <button
          type="button"
          onClick={() => onChange('monthly')}
          className={cn(buttonVariants({ active: !isYearly }))}
        >
          {monthlyLabel}
        </button>
        <button
          type="button"
          onClick={() => onChange('yearly')}
          className={cn(buttonVariants({ active: isYearly }))}
        >
          {yearlyLabel}
        </button>
      </div>
      {savingsPercentage > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            colorScheme === 'primary' && 'bg-primary/10 text-primary',
            colorScheme === 'secondary' && 'bg-secondary text-secondary-foreground',
            colorScheme === 'accent' && 'bg-accent/20 text-accent-foreground',
            colorScheme === 'muted' && 'bg-muted text-muted-foreground',
            colorScheme === 'destructive' && 'bg-destructive/10 text-destructive'
          )}
        >
          {savingsLabel} {savingsPercentage}%
        </span>
      )}
    </div>
  );
}
