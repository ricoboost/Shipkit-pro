'use client';

import { useState, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Star, StarHalf } from 'lucide-react';

const ratingVariants = cva('flex items-center', {
  variants: {
    size: {
      sm: 'gap-0.5',
      md: 'gap-1',
      lg: 'gap-1.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const starVariants = cva('transition-colors', {
  variants: {
    size: {
      sm: 'h-3.5 w-3.5',
      md: 'h-5 w-5',
      lg: 'h-7 w-7',
    },
    colorScheme: {
      primary: 'text-primary',
      secondary: 'text-secondary',
      accent: 'text-accent',
      yellow: 'text-yellow-400',
      orange: 'text-orange-400',
    },
  },
  defaultVariants: {
    size: 'md',
    colorScheme: 'yellow',
  },
});

export interface RatingProps extends VariantProps<typeof ratingVariants> {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  showValue?: boolean;
  precision?: 'full' | 'half';
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'yellow' | 'orange';
  emptyColor?: string;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  onChange,
  readonly = true,
  showValue = false,
  precision = 'half',
  size = 'md',
  colorScheme = 'yellow',
  emptyColor = 'text-muted-foreground/30',
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const displayValue = hoverValue ?? value;

  const handleMouseMove = useCallback(
    (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (readonly) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const halfWidth = rect.width / 2;

      if (precision === 'half' && x < halfWidth) {
        setHoverValue(index + 0.5);
      } else {
        setHoverValue(index + 1);
      }
    },
    [readonly, precision]
  );

  const handleClick = useCallback(
    (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
      if (readonly || !onChange) return;

      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const halfWidth = rect.width / 2;

      if (precision === 'half' && x < halfWidth) {
        onChange(index + 0.5);
      } else {
        onChange(index + 1);
      }
    },
    [readonly, onChange, precision]
  );

  const handleMouseLeave = useCallback(() => {
    if (!readonly) {
      setHoverValue(null);
    }
  }, [readonly]);

  const renderStar = (index: number) => {
    const filled = displayValue >= index + 1;
    const halfFilled = !filled && displayValue >= index + 0.5;

    const StarIcon = halfFilled ? StarHalf : Star;
    const isFilled = filled || halfFilled;

    const starElement = (
      <StarIcon
        className={cn(
          starVariants({ size, colorScheme: isFilled ? colorScheme : undefined }),
          !isFilled && emptyColor,
          isFilled && 'fill-current'
        )}
      />
    );

    if (readonly) {
      return (
        <span key={index} className="inline-flex">
          {starElement}
        </span>
      );
    }

    return (
      <button
        key={index}
        type="button"
        className={cn(
          'inline-flex cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
          'hover:scale-110 transition-transform'
        )}
        onMouseMove={(e) => handleMouseMove(index, e)}
        onClick={(e) => handleClick(index, e)}
        aria-label={`Rate ${index + 1} out of ${max}`}
      >
        {starElement}
      </button>
    );
  };

  return (
    <div
      className={cn(ratingVariants({ size }), className)}
      onMouseLeave={handleMouseLeave}
      role={readonly ? 'img' : 'group'}
      aria-label={readonly ? `Rating: ${value} out of ${max}` : 'Rating input'}
    >
      {Array.from({ length: max }, (_, i) => renderStar(i))}
      {showValue && (
        <span className="ml-2 text-sm font-medium text-muted-foreground">
          {value.toFixed(precision === 'half' ? 1 : 0)}
        </span>
      )}
    </div>
  );
}

// Compact rating display for cards
export interface RatingBadgeProps {
  value: number;
  max?: number;
  count?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function RatingBadge({
  value,
  max = 5,
  count,
  size = 'sm',
  className,
}: RatingBadgeProps) {
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <Star
        className={cn(
          'fill-yellow-400 text-yellow-400',
          size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )}
      />
      <span className={cn('font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {value.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className={cn('text-muted-foreground', size === 'sm' ? 'text-xs' : 'text-sm')}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}

// Rating distribution for showing review breakdowns
export interface RatingDistributionProps {
  distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  totalReviews?: number;
  averageRating?: number;
  className?: string;
}

export function RatingDistribution({
  distribution,
  totalReviews,
  averageRating,
  className,
}: RatingDistributionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {averageRating !== undefined && (
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <Rating value={averageRating} size="md" />
            {totalReviews !== undefined && (
              <p className="text-sm text-muted-foreground mt-1">
                {totalReviews.toLocaleString()} reviews
              </p>
            )}
          </div>
        </div>
      )}
      <div className="space-y-2">
        {distribution
          .sort((a, b) => b.rating - a.rating)
          .map(({ rating, count, percentage }) => (
            <div key={rating} className="flex items-center gap-3">
              <span className="text-sm w-3">{rating}</span>
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">
                {percentage}%
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
