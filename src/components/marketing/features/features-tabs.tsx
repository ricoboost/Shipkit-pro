'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import type { BaseMarketingProps } from '../types';
import { type ReactNode } from 'react';

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

const tabTriggerVariants = cva(
  'data-[state=active]:shadow-sm',
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

interface FeatureTab {
  id: string;
  label: string;
  icon?: ReactNode;
  title: string;
  description: string;
  image?: {
    src: string;
    alt: string;
  };
  highlights?: string[];
}

export interface FeaturesTabsProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  tabs: FeatureTab[];
  defaultTab?: string;
  animated?: boolean;
}

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
};

export function FeaturesTabs({
  title,
  subtitle,
  description,
  tabs,
  defaultTab,
  animated = true,
  colorScheme = 'primary',
  className,
}: FeaturesTabsProps) {
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

        <Tabs defaultValue={defaultTab || tabs[0]?.id} className="w-full">
          <TabsList className="mb-8 flex h-auto w-full flex-wrap justify-center gap-2 bg-transparent">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-4 py-2 transition-all',
                  tabTriggerVariants({ colorScheme })
                )}
              >
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab.id}
                  className="grid items-center gap-8 lg:grid-cols-2"
                  variants={animated ? contentVariants : undefined}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <div>
                    <h3 className="mb-4 text-2xl font-bold">{tab.title}</h3>
                    <p className="mb-6 text-muted-foreground leading-relaxed">
                      {tab.description}
                    </p>
                    {tab.highlights && (
                      <ul className="space-y-2">
                        {tab.highlights.map((highlight, index) => (
                          <li
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div
                              className={cn(
                                'h-1.5 w-1.5 rounded-full',
                                colorScheme === 'primary'
                                  ? 'bg-primary'
                                  : 'bg-muted-foreground'
                              )}
                            />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {tab.image && (
                    <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
                      <Image
                        src={tab.image.src}
                        alt={tab.image.alt}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}
