'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { BaseMarketingProps } from '../types';

const sectionVariants = cva('relative px-4 py-12 sm:py-16 overflow-hidden', {
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

export interface MarqueeLogo {
  name: string;
  src: string;
  href?: string;
}

export interface LogoMarqueeProps
  extends BaseMarketingProps,
    Omit<VariantProps<typeof sectionVariants>, 'colorScheme'> {
  title?: string;
  subtitle?: string;
  logos: MarqueeLogo[];
  speed?: 'slow' | 'normal' | 'fast';
  direction?: 'left' | 'right';
  pauseOnHover?: boolean;
  variant?: 'default' | 'grayscale';
}

export function LogoMarquee({
  title,
  subtitle,
  logos,
  speed = 'normal',
  direction = 'left',
  pauseOnHover = true,
  variant = 'default',
  colorScheme = 'primary',
  className,
}: LogoMarqueeProps) {
  const speeds = {
    slow: '60s',
    normal: '40s',
    fast: '20s',
  };

  // Duplicate logos for seamless loop
  const duplicatedLogos = [...logos, ...logos];

  return (
    <section className={cn(sectionVariants({ colorScheme }), className)}>
      <div className="mx-auto max-w-5xl">
        {(title || subtitle) && (
          <div className="mb-8 text-center">
            {subtitle && (
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-lg font-medium text-muted-foreground">{title}</h2>
            )}
          </div>
        )}
      </div>

      <div
        className={cn('relative', pauseOnHover && 'group')}
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div
          className={cn(
            'flex gap-12 w-max',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
          style={{
            animation: `marquee ${speeds[speed]} linear infinite`,
            animationDirection: direction === 'right' ? 'reverse' : 'normal',
          }}
        >
          {duplicatedLogos.map((logo, index) => {
            const LogoContent = (
              <div
                className={cn(
                  'flex items-center justify-center h-12 px-4',
                  variant === 'grayscale' && 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all'
                )}
              >
                <Image
                  src={logo.src}
                  alt={logo.name}
                  width={140}
                  height={40}
                  className="h-8 w-auto object-contain"
                />
              </div>
            );

            if (logo.href) {
              return (
                <a
                  key={index}
                  href={logo.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                  aria-label={logo.name}
                >
                  {LogoContent}
                </a>
              );
            }

            return (
              <div key={index} className="flex-shrink-0">
                {LogoContent}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
