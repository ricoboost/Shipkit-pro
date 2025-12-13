'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Rating } from '@/components/ui/rating';
import { Quote } from 'lucide-react';
import type { TestimonialItem, BaseMarketingProps } from '../types';

const cardVariants = cva(
  'relative rounded-2xl border p-6 transition-all',
  {
    variants: {
      colorScheme: {
        primary: 'bg-card border-border hover:border-primary/50 hover:shadow-lg',
        secondary: 'bg-secondary/5 border-secondary/20 hover:border-secondary/50',
        accent: 'bg-accent/5 border-accent/20 hover:border-accent/50',
        muted: 'bg-muted/30 border-muted-foreground/10 hover:border-muted-foreground/30',
        destructive: 'bg-destructive/5 border-destructive/20 hover:border-destructive/50',
      },
      variant: {
        default: '',
        elevated: 'shadow-md',
        bordered: 'border-2',
        ghost: 'border-transparent bg-transparent',
      },
    },
    defaultVariants: {
      colorScheme: 'primary',
      variant: 'default',
    },
  }
);

const quoteVariants = cva('absolute opacity-10', {
  variants: {
    colorScheme: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent',
      muted: 'text-muted-foreground',
      destructive: 'text-destructive',
    },
  },
  defaultVariants: {
    colorScheme: 'primary',
  },
});

export interface TestimonialCardProps
  extends TestimonialItem,
    BaseMarketingProps,
    Omit<VariantProps<typeof cardVariants>, 'colorScheme'> {
  showQuoteIcon?: boolean;
  showRating?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TestimonialCard({
  content,
  author,
  rating,
  showQuoteIcon = true,
  showRating = true,
  size = 'md',
  colorScheme = 'primary',
  variant = 'default',
  className,
}: TestimonialCardProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const avatarSizes = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div
      className={cn(
        cardVariants({ colorScheme, variant }),
        sizeClasses[size],
        className
      )}
    >
      {showQuoteIcon && (
        <Quote
          className={cn(
            quoteVariants({ colorScheme }),
            'top-4 right-4 h-8 w-8'
          )}
        />
      )}

      {showRating && rating && (
        <div className="mb-4">
          <Rating value={rating} size="sm" readonly />
        </div>
      )}

      <blockquote className={cn('mb-6', textSizes[size])}>
        &ldquo;{content}&rdquo;
      </blockquote>

      <div className="flex items-center gap-3">
        <Avatar className={avatarSizes[size]}>
          {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
          <AvatarFallback>
            {author.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-sm">{author.name}</div>
          {(author.title || author.company) && (
            <div className="text-xs text-muted-foreground">
              {author.title}
              {author.title && author.company && ' at '}
              {author.company}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Featured testimonial with larger layout
export interface TestimonialFeaturedProps
  extends TestimonialItem,
    BaseMarketingProps {
  image?: string;
  imagePosition?: 'left' | 'right';
}

export function TestimonialFeatured({
  content,
  author,
  rating,
  image,
  imagePosition = 'left',
  colorScheme = 'primary',
  className,
}: TestimonialFeaturedProps) {
  return (
    <div
      className={cn(
        'grid gap-8 items-center',
        image ? 'lg:grid-cols-2' : '',
        className
      )}
    >
      {image && imagePosition === 'left' && (
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          <img
            src={image}
            alt={`${author.name}'s testimonial`}
            className="object-cover w-full h-full"
          />
        </div>
      )}

      <div className={cn('space-y-6', !image && 'text-center max-w-2xl mx-auto')}>
        {rating && (
          <Rating value={rating} size="lg" readonly className={!image ? 'justify-center' : ''} />
        )}

        <blockquote className="text-xl md:text-2xl font-medium leading-relaxed">
          &ldquo;{content}&rdquo;
        </blockquote>

        <div className={cn('flex items-center gap-4', !image && 'justify-center')}>
          <Avatar className="h-14 w-14">
            {author.avatar && <AvatarImage src={author.avatar} alt={author.name} />}
            <AvatarFallback className="text-lg">
              {author.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{author.name}</div>
            {(author.title || author.company) && (
              <div className="text-sm text-muted-foreground">
                {author.title}
                {author.title && author.company && ' at '}
                {author.company}
              </div>
            )}
          </div>
        </div>
      </div>

      {image && imagePosition === 'right' && (
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          <img
            src={image}
            alt={`${author.name}'s testimonial`}
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
}
