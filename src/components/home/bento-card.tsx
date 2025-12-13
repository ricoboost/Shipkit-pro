'use client';

import { motion } from 'framer-motion';
import { type LucideIcon, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BentoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  className?: string;
  gradient?: string;
  size?: 'default' | 'large' | 'wide';
  onClick?: () => void;
  highlights?: string[];
}

export function BentoCard({
  title,
  description,
  icon: Icon,
  href,
  className,
  gradient = 'from-primary/10 to-primary/5',
  size = 'default',
  onClick,
  highlights,
}: BentoCardProps) {
  const sizeClasses = {
    default: '',
    large: 'col-span-1 md:col-span-2 md:row-span-2',
    wide: 'col-span-1 md:col-span-2',
  };

  const Component = href ? 'a' : 'div';
  const componentProps = href
    ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: href.startsWith('http') ? 'noopener noreferrer' : undefined }
    : {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(sizeClasses[size], className)}
    >
      <Component
        {...componentProps}
        onClick={onClick}
        className={cn(
          'group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all',
          'hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5',
          onClick && 'cursor-pointer',
          href && 'cursor-pointer'
        )}
      >
        {/* Background gradient */}
        <div
          className={cn(
            'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100',
            gradient
          )}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          {highlights && highlights.length > 0 && (
            <ul className="mt-3 space-y-1.5 flex-grow">
              {highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-primary shrink-0" />
                  <span>{highlight}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Arrow indicator for clickable cards */}
        {(href || onClick) && (
          <div className="absolute bottom-4 right-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
            <svg
              className="h-5 w-5 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </div>
        )}
      </Component>
    </motion.div>
  );
}
