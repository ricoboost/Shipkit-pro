'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { BaseMarketingProps, FeatureItem } from '../types';

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

const iconVariants = cva(
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
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

export interface FeaturesAccordionProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  features: FeatureItem[];
  defaultOpen?: string;
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5 },
  },
};

export function FeaturesAccordion({
  title,
  subtitle,
  description,
  features,
  defaultOpen,
  animated = true,
  colorScheme = 'primary',
  className,
}: FeaturesAccordionProps) {
  const Wrapper = animated ? motion.div : 'div';

  const wrapperProps = animated
    ? {
        variants: containerVariants,
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once: true, margin: '-100px' },
      }
    : {};

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-4xl">
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
          <Accordion
            type="single"
            collapsible
            defaultValue={defaultOpen}
            className="w-full"
          >
            {features.map((feature, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-b"
              >
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex items-center gap-4 text-left">
                    {feature.icon && (
                      <div className={cn(iconVariants({ colorScheme }))}>
                        {feature.icon}
                      </div>
                    )}
                    <span className="font-semibold">{feature.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 pt-2">
                  <p className="pl-14 text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Wrapper>
      </div>
    </section>
  );
}
