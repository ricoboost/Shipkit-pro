'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ImageBlock } from '@/lib/waitlist-builder/types';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface ImageBlockComponentProps {
  block: ImageBlock;
  sectionId: string;
  className?: string;
}

const shadowStyles = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
};

export function ImageBlockComponent({
  block,
  sectionId,
  className,
}: ImageBlockComponentProps) {
  const { isPreviewMode, selectedBlockId, selectBlock, removeBlock } =
    useEditorStore();
  const isSelected = selectedBlockId === block.id;

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      selectBlock(block.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeBlock(sectionId, block.id);
  };

  // Build styles
  const imageStyle: React.CSSProperties = {
    width: block.width ? `${block.width}px` : undefined,
    height: block.height ? `${block.height}px` : undefined,
    objectFit: block.objectFit || 'cover',
    borderRadius: block.borderRadius ? `${block.borderRadius}px` : undefined,
    borderWidth: block.border?.width ? `${block.border.width}px` : undefined,
    borderColor: block.border?.color ? `hsl(${block.border.color})` : undefined,
    borderStyle: block.border?.style || undefined,
  };

  const containerStyle: React.CSSProperties = {
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
  };

  return (
    <div
      className={cn('relative inline-block', className)}
      style={containerStyle}
      onClick={handleClick}
    >
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

      <Image
        src={block.src}
        alt={block.alt}
        width={block.width || 400}
        height={block.height || 300}
        className={cn(
          'max-w-full transition-all',
          shadowStyles[block.shadow || 'none'],
          !isPreviewMode && 'cursor-pointer',
          !isPreviewMode &&
            isSelected &&
            'ring-2 ring-primary ring-offset-2',
          !isPreviewMode &&
            !isSelected &&
            'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2'
        )}
        style={imageStyle}
        unoptimized
      />
    </div>
  );
}
