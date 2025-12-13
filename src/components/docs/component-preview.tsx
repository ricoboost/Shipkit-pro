'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Monitor, Smartphone, Tablet, Maximize2, Minimize2 } from 'lucide-react';

interface ComponentPreviewProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  background?: 'default' | 'muted' | 'dots' | 'grid';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function ComponentPreview({
  children,
  title,
  description,
  className,
  background = 'dots',
  padding = 'md',
  fullWidth = false,
}: ComponentPreviewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isExpanded, setIsExpanded] = useState(false);

  const backgroundStyles = {
    default: 'bg-background',
    muted: 'bg-muted/30',
    dots: 'bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#374151_1px,transparent_1px)]',
    grid: 'bg-background bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[linear-gradient(to_right,#374151_1px,transparent_1px),linear-gradient(to_bottom,#374151_1px,transparent_1px)]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12',
  };

  const viewportWidths = {
    desktop: 'w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[375px]',
  };

  return (
    <div className={cn('my-8 rounded-xl border overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2">
        <div>
          {title && <h4 className="font-medium text-sm">{title}</h4>}
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="flex items-center gap-1">
          {/* Viewport toggles */}
          <div className="flex items-center border rounded-lg p-0.5 mr-2">
            <button
              onClick={() => setViewport('desktop')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewport === 'desktop' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Desktop view"
            >
              <Monitor className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewport === 'tablet' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Tablet view"
            >
              <Tablet className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={cn(
                'p-1.5 rounded-md transition-colors',
                viewport === 'mobile' ? 'bg-background shadow-sm' : 'hover:bg-background/50'
              )}
              title="Mobile view"
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
          </div>
          {/* Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-md hover:bg-background/50 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Preview area */}
      <div
        className={cn(
          'overflow-auto transition-all duration-300',
          backgroundStyles[background],
          paddingStyles[padding],
          isExpanded ? 'max-h-none' : 'max-h-[600px]'
        )}
      >
        <div
          className={cn(
            'mx-auto transition-all duration-300',
            !fullWidth && viewportWidths[viewport]
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

// Variant tabs for showing multiple variants
interface VariantTabsProps {
  variants: {
    name: string;
    component: React.ReactNode;
  }[];
  defaultVariant?: string;
}

export function VariantTabs({ variants, defaultVariant }: VariantTabsProps) {
  const [activeVariant, setActiveVariant] = useState(defaultVariant || variants[0]?.name);

  const activeComponent = variants.find((v) => v.name === activeVariant)?.component;

  return (
    <div className="my-8">
      {/* Variant selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {variants.map((variant) => (
          <button
            key={variant.name}
            onClick={() => setActiveVariant(variant.name)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              activeVariant === variant.name
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background hover:bg-muted border-border'
            )}
          >
            {variant.name}
          </button>
        ))}
      </div>

      {/* Active component */}
      <ComponentPreview title={activeVariant}>
        {activeComponent}
      </ComponentPreview>
    </div>
  );
}
