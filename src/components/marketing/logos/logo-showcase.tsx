'use client';

import { motion } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';
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

export interface ShowcaseLogo {
  name: string;
  src: string;
  description?: string;
  href?: string;
  featured?: boolean;
}

export interface LogoShowcaseProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  description?: string;
  logos: ShowcaseLogo[];
  animated?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export function LogoShowcase({
  title,
  subtitle,
  description,
  logos,
  animated = true,
  colorScheme = 'primary',
  className,
}: LogoShowcaseProps) {
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

  const itemProps = animated ? { variants: itemVariants } : {};

  const featuredLogos = logos.filter((l) => l.featured);
  const regularLogos = logos.filter((l) => !l.featured);

  const LogoCard = ({ logo }: { logo: ShowcaseLogo }) => {
    const content = (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-6 rounded-xl border bg-card transition-all',
          logo.featured ? 'col-span-2 row-span-2' : '',
          logo.href && 'hover:border-primary/50 hover:shadow-lg cursor-pointer'
        )}
      >
        <div className={cn('mb-4', logo.featured ? 'h-16' : 'h-10')}>
          <Image
            src={logo.src}
            alt={logo.name}
            width={logo.featured ? 200 : 120}
            height={logo.featured ? 64 : 40}
            className="h-full w-auto object-contain"
          />
        </div>
        <div className="text-center">
          <h3 className={cn('font-semibold', logo.featured ? 'text-lg' : 'text-sm')}>
            {logo.name}
          </h3>
          {logo.description && (
            <p className="mt-1 text-xs text-muted-foreground">{logo.description}</p>
          )}
        </div>
      </div>
    );

    if (logo.href) {
      return (
        <a
          href={logo.href}
          target="_blank"
          rel="noopener noreferrer"
          className={logo.featured ? 'col-span-2 row-span-2' : ''}
        >
          {content}
        </a>
      );
    }

    return content;
  };

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-5xl">
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

        {/* Featured logos first if any */}
        {featuredLogos.length > 0 && (
          <Wrapper className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" {...wrapperProps}>
            {featuredLogos.map((logo, index) => (
              <Item key={`featured-${index}`} {...itemProps}>
                <LogoCard logo={logo} />
              </Item>
            ))}
          </Wrapper>
        )}

        {/* Regular logos */}
        <Wrapper
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          {...wrapperProps}
        >
          {regularLogos.map((logo, index) => (
            <Item key={index} {...itemProps}>
              <LogoCard logo={logo} />
            </Item>
          ))}
        </Wrapper>
      </div>
    </section>
  );
}
