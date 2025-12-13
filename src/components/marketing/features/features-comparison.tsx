'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check, X, Minus } from 'lucide-react';
import type { BaseMarketingProps } from '../types';

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

const highlightVariants = cva(
  'border-2',
  {
    variants: {
      colorScheme: {
        primary: 'border-primary bg-primary/5',
        secondary: 'border-secondary bg-secondary/10',
        accent: 'border-accent bg-accent/10',
        muted: 'border-muted-foreground bg-muted',
        destructive: 'border-destructive bg-destructive/5',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

const checkVariants = cva(
  'h-5 w-5',
  {
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
  }
);

interface ComparisonColumn {
  name: string;
  highlighted?: boolean;
  badge?: string;
}

interface ComparisonRow {
  feature: string;
  values: (boolean | string | null)[];
}

export interface FeaturesComparisonProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  columns: ComparisonColumn[];
  rows: ComparisonRow[];
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export function FeaturesComparison({
  title,
  subtitle,
  description,
  columns,
  rows,
  animated = true,
  colorScheme = 'primary',
  className,
}: FeaturesComparisonProps) {
  const Wrapper = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
      }
    : {};

  const renderValue = (value: boolean | string | null) => {
    if (value === true) {
      return <Check className={cn(checkVariants({ colorScheme }))} />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-muted-foreground/50" />;
    }
    if (value === null) {
      return <Minus className="h-5 w-5 text-muted-foreground/50" />;
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-6xl">
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

        <Wrapper {...wrapperProps}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 text-left font-medium text-muted-foreground">
                    Features
                  </th>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={cn(
                        'p-4 text-center',
                        column.highlighted &&
                          cn(
                            'rounded-t-xl',
                            highlightVariants({ colorScheme })
                          )
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {column.badge && (
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-xs font-medium',
                              colorScheme === 'primary'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            )}
                          >
                            {column.badge}
                          </span>
                        )}
                        <span className="font-semibold">{column.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={cn(
                      rowIndex % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'
                    )}
                  >
                    <td className="p-4 text-sm">{row.feature}</td>
                    {row.values.map((value, colIndex) => (
                      <td
                        key={colIndex}
                        className={cn(
                          'p-4 text-center',
                          columns[colIndex]?.highlighted &&
                            highlightVariants({ colorScheme }),
                          rowIndex === rows.length - 1 &&
                            columns[colIndex]?.highlighted &&
                            'rounded-b-xl'
                        )}
                      >
                        <div className="flex items-center justify-center">
                          {renderValue(value)}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Wrapper>
      </div>
    </section>
  );
}
