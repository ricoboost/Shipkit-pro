'use client';

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Check, X, Minus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { BaseMarketingProps } from '../types';

const sectionVariants = cva('relative px-4 py-16 sm:py-20', {
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

export interface Competitor {
  name: string;
  highlighted?: boolean;
  badge?: string;
}

export interface ComparisonFeature {
  name: string;
  category?: string;
  values: (boolean | string | null)[];
}

export interface ComparisonTableProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  competitors: Competitor[];
  features: ComparisonFeature[];
  animated?: boolean;
}

export function ComparisonTable({
  title,
  subtitle,
  description,
  competitors,
  features,
  animated = true,
  colorScheme = 'primary',
  className,
}: ComparisonTableProps) {
  const renderValue = (value: boolean | string | null, isHighlighted: boolean) => {
    if (value === true) {
      return (
        <Check
          className={cn(
            'h-5 w-5 mx-auto',
            isHighlighted ? 'text-primary' : 'text-muted-foreground'
          )}
        />
      );
    }
    if (value === false) {
      return <X className="h-5 w-5 mx-auto text-muted-foreground/50" />;
    }
    if (value === null) {
      return <Minus className="h-5 w-5 mx-auto text-muted-foreground/30" />;
    }
    return (
      <span className={cn('text-sm', isHighlighted && 'font-medium')}>
        {value}
      </span>
    );
  };

  // Group features by category
  const groupedFeatures = features.reduce((acc, feature) => {
    const category = feature.category || 'Features';
    if (!acc[category]) acc[category] = [];
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, ComparisonFeature[]>);

  const Wrapper = animated ? motion.div : 'div';
  const wrapperProps = animated
    ? {
        initial: { opacity: 0, y: 20 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: '-100px' },
        transition: { duration: 0.5 },
      }
    : {};

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

        <Wrapper className="overflow-x-auto" {...wrapperProps}>
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left p-4 border-b bg-muted/30 min-w-[200px]">
                  Feature
                </th>
                {competitors.map((competitor, index) => (
                  <th
                    key={index}
                    className={cn(
                      'p-4 border-b text-center min-w-[140px]',
                      competitor.highlighted
                        ? 'bg-primary/10 border-x border-primary/20'
                        : 'bg-muted/30'
                    )}
                  >
                    <div className="relative">
                      {competitor.badge && (
                        <Badge className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs">
                          {competitor.badge}
                        </Badge>
                      )}
                      <span
                        className={cn(
                          'font-bold',
                          competitor.highlighted && 'text-primary'
                        )}
                      >
                        {competitor.name}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                <Fragment key={category}>
                  <tr>
                    <td
                      colSpan={competitors.length + 1}
                      className="p-4 font-semibold text-sm uppercase tracking-wider bg-muted/50 border-y"
                    >
                      {category}
                    </td>
                  </tr>
                  {categoryFeatures.map((feature, featureIndex) => (
                    <tr
                      key={`feature-${feature.name}`}
                      className={cn(
                        featureIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'
                      )}
                    >
                      <td className="p-4 text-sm border-b">{feature.name}</td>
                      {feature.values.map((value, valueIndex) => (
                        <td
                          key={valueIndex}
                          className={cn(
                            'p-4 text-center border-b',
                            competitors[valueIndex]?.highlighted &&
                              'border-x border-primary/20 bg-primary/5'
                          )}
                        >
                          {renderValue(value, competitors[valueIndex]?.highlighted || false)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </Wrapper>
      </div>
    </section>
  );
}
