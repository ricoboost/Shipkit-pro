'use client';

import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

export type DividerColorScheme = 'primary' | 'secondary' | 'accent' | 'muted' | 'destructive' | 'background' | 'foreground';

const dividerVariants = cva('w-full overflow-hidden', {
  variants: {
    colorScheme: {
      primary: '[--divider-fill:hsl(var(--primary))]',
      secondary: '[--divider-fill:hsl(var(--secondary))]',
      accent: '[--divider-fill:hsl(var(--accent))]',
      muted: '[--divider-fill:hsl(var(--muted))]',
      destructive: '[--divider-fill:hsl(var(--destructive))]',
      background: '[--divider-fill:hsl(var(--background))]',
      foreground: '[--divider-fill:hsl(var(--foreground)/0.1)]',
    },
    size: {
      sm: 'h-8',
      md: 'h-16',
      lg: 'h-24',
      xl: 'h-32',
    },
  },
  defaultVariants: {
    colorScheme: 'background',
    size: 'md',
  },
});

export type DividerShape = 'wave' | 'curve' | 'angle' | 'zigzag' | 'triangle' | 'rounded';

export interface SectionDividerProps {
  shape?: DividerShape;
  flip?: boolean;
  flipX?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: DividerColorScheme;
  className?: string;
}

const shapes: Record<DividerShape, string> = {
  wave: `M0,64 C320,128 480,0 640,64 C800,128 960,0 1280,64 L1280,160 L0,160 Z`,
  curve: `M0,128 Q640,0 1280,128 L1280,160 L0,160 Z`,
  angle: `M0,160 L1280,64 L1280,160 Z`,
  zigzag: `M0,160 L160,80 L320,160 L480,80 L640,160 L800,80 L960,160 L1120,80 L1280,160 Z`,
  triangle: `M0,160 L640,32 L1280,160 Z`,
  rounded: `M0,160 C426.67,160 426.67,64 640,64 C853.33,64 853.33,160 1280,160 Z`,
};

export function SectionDivider({
  shape = 'wave',
  flip = false,
  flipX = false,
  colorScheme = 'background',
  size = 'md',
  className,
}: SectionDividerProps) {
  return (
    <div
      className={cn(
        dividerVariants({ colorScheme, size }),
        flip && 'rotate-180',
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1280 160"
        preserveAspectRatio="none"
        className={cn('w-full h-full', flipX && 'scale-x-[-1]')}
        fill="var(--divider-fill)"
      >
        <path d={shapes[shape]} />
      </svg>
    </div>
  );
}

// Gradient divider for smooth color transitions
export interface GradientDividerProps {
  from?: string;
  to?: string;
  direction?: 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const gradientSizes = {
  sm: 'h-8',
  md: 'h-16',
  lg: 'h-24',
  xl: 'h-32',
};

export function GradientDivider({
  from = 'transparent',
  to = 'hsl(var(--background))',
  direction = 'bottom',
  size = 'md',
  className,
}: GradientDividerProps) {
  return (
    <div
      className={cn('w-full', gradientSizes[size], className)}
      style={{
        background: `linear-gradient(to ${direction}, ${from}, ${to})`,
      }}
      aria-hidden="true"
    />
  );
}

// Animated wave divider with motion
export interface AnimatedDividerProps {
  speed?: 'slow' | 'medium' | 'fast';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  colorScheme?: DividerColorScheme;
  className?: string;
}

const speedClasses = {
  slow: 'animate-[wave_8s_ease-in-out_infinite]',
  medium: 'animate-[wave_5s_ease-in-out_infinite]',
  fast: 'animate-[wave_3s_ease-in-out_infinite]',
};

export function AnimatedDivider({
  speed = 'medium',
  colorScheme = 'background',
  size = 'md',
  className,
}: AnimatedDividerProps) {
  return (
    <div
      className={cn(
        dividerVariants({ colorScheme, size }),
        'relative',
        className
      )}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className={cn('w-full h-full absolute', speedClasses[speed])}
        fill="var(--divider-fill)"
      >
        <path d="M0,64 C240,128 480,0 720,64 C960,128 1200,0 1440,64 L1440,160 L0,160 Z" />
      </svg>
      <svg
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        className={cn(
          'w-full h-full absolute opacity-50',
          speedClasses[speed],
          'animation-delay-1000'
        )}
        fill="var(--divider-fill)"
        style={{ animationDelay: '-2s' }}
      >
        <path d="M0,96 C240,32 480,128 720,96 C960,64 1200,128 1440,96 L1440,160 L0,160 Z" />
      </svg>
    </div>
  );
}

// Simple line divider with optional text
export type LineColorScheme = 'primary' | 'secondary' | 'accent' | 'muted' | 'destructive';

export interface LineDividerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  colorScheme?: LineColorScheme;
  className?: string;
}

const lineSizes = {
  sm: 'border-t',
  md: 'border-t-2',
  lg: 'border-t-4',
};

const lineColors = {
  primary: 'border-primary',
  secondary: 'border-secondary',
  accent: 'border-accent',
  muted: 'border-muted',
  destructive: 'border-destructive',
};

export function LineDivider({
  text,
  colorScheme = 'muted',
  size = 'sm',
  className,
}: LineDividerProps) {
  if (text) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div
          className={cn('flex-1', lineSizes[size], lineColors[colorScheme as keyof typeof lineColors])}
        />
        <span className="text-sm text-muted-foreground font-medium">{text}</span>
        <div
          className={cn('flex-1', lineSizes[size], lineColors[colorScheme as keyof typeof lineColors])}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-full',
        lineSizes[size],
        lineColors[colorScheme as keyof typeof lineColors],
        className
      )}
      aria-hidden="true"
    />
  );
}
