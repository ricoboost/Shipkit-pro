'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ButtonBlock } from '@/lib/waitlist-builder/types';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface ButtonBlockComponentProps {
  block: ButtonBlock;
  sectionId: string;
  className?: string;
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  default: 'h-10 px-4 py-2',
  lg: 'h-12 px-6 text-base',
  xl: 'h-14 px-8 text-lg',
};

export function ButtonBlockComponent({
  block,
  sectionId,
  className,
}: ButtonBlockComponentProps) {
  const { isPreviewMode, selectedBlockId, selectBlock, removeBlock } =
    useEditorStore();
  const isSelected = selectedBlockId === block.id;

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      e.preventDefault();
      selectBlock(block.id);
    } else if (block.action === 'link' && block.href) {
      if (block.openNewTab) {
        window.open(block.href, '_blank');
      } else {
        window.location.href = block.href;
      }
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeBlock(sectionId, block.id);
  };

  // Build styles
  const buttonStyle: React.CSSProperties = {
    backgroundColor: block.backgroundColor
      ? `hsl(${block.backgroundColor})`
      : undefined,
    color: block.textColor ? `hsl(${block.textColor})` : undefined,
    borderRadius: block.borderRadius ? `${block.borderRadius}px` : undefined,
    // Spacing
    marginTop: block.spacing?.marginTop
      ? `${block.spacing.marginTop}px`
      : undefined,
    marginBottom: block.spacing?.marginBottom
      ? `${block.spacing.marginBottom}px`
      : undefined,
    marginLeft: block.spacing?.marginLeft
      ? `${block.spacing.marginLeft}px`
      : undefined,
    marginRight: block.spacing?.marginRight
      ? `${block.spacing.marginRight}px`
      : undefined,
    // Dimensions
    width: block.dimensions?.width,
    maxWidth: block.dimensions?.maxWidth,
    minWidth: block.dimensions?.minWidth,
  };

  // Determine variant classes (only if no custom colors)
  const getVariantClasses = () => {
    if (block.backgroundColor || block.textColor) {
      return 'hover:opacity-90';
    }
    switch (block.variant) {
      case 'secondary':
        return 'bg-secondary text-secondary-foreground hover:bg-secondary/80';
      case 'outline':
        return 'border border-input bg-background hover:bg-accent hover:text-accent-foreground';
      case 'ghost':
        return 'hover:bg-accent hover:text-accent-foreground';
      case 'destructive':
        return 'bg-destructive text-destructive-foreground hover:bg-destructive/90';
      default:
        return 'bg-primary text-primary-foreground hover:bg-primary/90';
    }
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Delete button */}
      {!isPreviewMode && isSelected && (
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-2 -right-2 h-6 w-6 z-10"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}

      <button
        onClick={handleClick}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
          'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          getVariantClasses(),
          sizeStyles[block.size],
          !isPreviewMode && 'cursor-pointer',
          !isPreviewMode &&
            isSelected &&
            'ring-2 ring-primary ring-offset-2',
          !isPreviewMode &&
            !isSelected &&
            'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2'
        )}
        style={buttonStyle}
      >
        {block.text}
      </button>
    </div>
  );
}
