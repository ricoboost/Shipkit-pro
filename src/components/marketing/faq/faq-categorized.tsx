'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

const tabTriggerVariants = cva(
  'data-[state=active]:shadow-sm transition-all',
  {
    variants: {
      colorScheme: {
        primary: 'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground',
        secondary: 'data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground',
        accent: 'data-[state=active]:bg-accent data-[state=active]:text-accent-foreground',
        muted: 'data-[state=active]:bg-muted-foreground data-[state=active]:text-muted',
        destructive: 'data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
    },
  }
);

export interface FAQCategory {
  name: string;
  icon?: React.ReactNode;
  items: FAQItem[];
}

export interface FAQCategorizedProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  categories: FAQCategory[];
  defaultCategory?: string;
  animated?: boolean;
}

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
};

export function FAQCategorized({
  title,
  subtitle,
  description,
  categories,
  defaultCategory,
  animated = true,
  colorScheme = 'primary',
  className,
}: FAQCategorizedProps) {
  const [activeCategory, setActiveCategory] = useState(
    defaultCategory || categories[0]?.name || ''
  );

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

        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="w-full"
        >
          <TabsList className="flex h-auto w-full flex-wrap justify-center gap-2 bg-transparent mb-8">
            {categories.map((category) => (
              <TabsTrigger
                key={category.name}
                value={category.name}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2',
                  tabTriggerVariants({ colorScheme })
                )}
              >
                {category.icon}
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.name} value={category.name} className="mt-0">
              <AnimatePresence mode="wait">
                {activeCategory === category.name && (
                  <motion.div
                    key={category.name}
                    variants={animated ? contentVariants : undefined}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Accordion type="single" collapsible className="space-y-3">
                      {category.items.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`${category.name}-item-${index}`}
                          className="border rounded-lg px-4 bg-card"
                        >
                          <AccordionTrigger className="text-left font-medium hover:no-underline py-4">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground pb-4">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
