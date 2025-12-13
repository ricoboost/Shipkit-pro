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
import type { BaseMarketingProps, FAQItem } from '../types';

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

const itemVariants = cva('border rounded-lg px-4 mb-3', {
  variants: {
    colorScheme: {
      primary: 'border-border hover:border-primary/50',
      secondary: 'border-secondary/30 hover:border-secondary/60',
      accent: 'border-accent/30 hover:border-accent/60',
      muted: 'border-muted-foreground/20 hover:border-muted-foreground/40',
      destructive: 'border-destructive/30 hover:border-destructive/60',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface FAQAccordionProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  items: FAQItem[];
  defaultOpen?: number | number[];
  allowMultiple?: boolean;
  animated?: boolean;
  variant?: 'default' | 'bordered' | 'separated';
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export function FAQAccordion({
  title,
  subtitle,
  description,
  items,
  defaultOpen,
  allowMultiple = false,
  animated = true,
  variant = 'bordered',
  colorScheme = 'primary',
  className,
}: FAQAccordionProps) {
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

  const itemProps = animated ? { variants: fadeVariants } : {};

  // Convert defaultOpen to array of string values
  const defaultValue = defaultOpen
    ? Array.isArray(defaultOpen)
      ? defaultOpen.map((i) => `item-${i}`)
      : [`item-${defaultOpen}`]
    : undefined;

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-3xl">
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
            type={allowMultiple ? 'multiple' : 'single'}
            defaultValue={defaultValue as any}
            collapsible={!allowMultiple}
            className={cn(variant === 'default' && 'divide-y')}
          >
            {items.map((item, index) => (
              <Item key={index} {...itemProps}>
                <AccordionItem
                  value={`item-${index}`}
                  className={cn(
                    variant === 'bordered' && itemVariants({ colorScheme }),
                    variant === 'separated' && 'border rounded-lg px-4 mb-3 bg-card',
                    variant === 'default' && 'border-0'
                  )}
                >
                  <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </Item>
            ))}
          </Accordion>
        </Wrapper>
      </div>
    </section>
  );
}
