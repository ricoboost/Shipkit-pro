'use client';

import { useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { TextBlock, FontWeight } from '@/lib/waitlist-builder/types';
import { useEditorStore } from '../editor/use-editor-state';

interface EditableTextProps {
  block: TextBlock;
  onUpdate: (updates: Partial<TextBlock>) => void;
  className?: string;
}

// Base variant styles (without font size if custom is set)
const variantStyles: Record<TextBlock['variant'], string> = {
  h1: 'text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight',
  h2: 'text-3xl md:text-4xl font-bold tracking-tight',
  h3: 'text-2xl md:text-3xl font-semibold',
  h4: 'text-xl md:text-2xl font-semibold',
  p: 'text-base',
  lead: 'text-lg md:text-xl',
  muted: 'text-sm text-muted-foreground',
  small: 'text-xs',
};

const alignmentStyles: Record<TextBlock['alignment'], string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const fontWeightStyles: Record<FontWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
};

export function EditableText({ block, onUpdate, className }: EditableTextProps) {
  const { isPreviewMode, selectedBlockId, selectBlock } = useEditorStore();
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = selectedBlockId === block.id;

  // Sync content when block changes externally
  useEffect(() => {
    if (ref.current && ref.current.textContent !== block.content) {
      ref.current.textContent = block.content;
    }
  }, [block.content]);

  const handleInput = useCallback(() => {
    if (ref.current) {
      const newContent = ref.current.textContent || '';
      if (newContent !== block.content) {
        onUpdate({ content: newContent });
      }
    }
  }, [block.content, onUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter from creating new lines in headings
    if (e.key === 'Enter' && block.variant.startsWith('h')) {
      e.preventDefault();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      selectBlock(block.id);
    }
  };

  // Build style object with custom properties
  const style: React.CSSProperties = {
    color: block.color ? `hsl(${block.color})` : undefined,
    fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
    lineHeight: block.lineHeight ? block.lineHeight : undefined,
    letterSpacing: block.letterSpacing ? `${block.letterSpacing}px` : undefined,
    // Dimensions
    width: block.dimensions?.width,
    maxWidth: block.dimensions?.maxWidth,
    minWidth: block.dimensions?.minWidth,
    height: block.dimensions?.height,
    maxHeight: block.dimensions?.maxHeight,
    minHeight: block.dimensions?.minHeight,
    // Spacing
    marginTop: block.spacing?.marginTop ? `${block.spacing.marginTop}px` : undefined,
    marginBottom: block.spacing?.marginBottom ? `${block.spacing.marginBottom}px` : undefined,
    marginLeft: block.spacing?.marginLeft ? `${block.spacing.marginLeft}px` : undefined,
    marginRight: block.spacing?.marginRight ? `${block.spacing.marginRight}px` : undefined,
    paddingTop: block.spacing?.paddingTop ? `${block.spacing.paddingTop}px` : undefined,
    paddingBottom: block.spacing?.paddingBottom ? `${block.spacing.paddingBottom}px` : undefined,
    paddingLeft: block.spacing?.paddingLeft ? `${block.spacing.paddingLeft}px` : undefined,
    paddingRight: block.spacing?.paddingRight ? `${block.spacing.paddingRight}px` : undefined,
  };

  // Determine which classes to apply based on custom settings
  const hasCustomFontSize = !!block.fontSize;
  const hasCustomFontWeight = !!block.fontWeight;

  // In preview mode, just render the text
  if (isPreviewMode) {
    const Tag = block.variant.startsWith('h')
      ? (block.variant as 'h1' | 'h2' | 'h3' | 'h4')
      : 'p';
    return (
      <Tag
        className={cn(
          // Only apply variant styles if no custom overrides
          !hasCustomFontSize && variantStyles[block.variant],
          hasCustomFontSize && (block.variant.startsWith('h') ? 'tracking-tight' : ''),
          alignmentStyles[block.alignment],
          hasCustomFontWeight && block.fontWeight && fontWeightStyles[block.fontWeight],
          className
        )}
        style={style}
      >
        {block.content}
      </Tag>
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onClick={handleClick}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className={cn(
        // Only apply variant styles if no custom overrides
        !hasCustomFontSize && variantStyles[block.variant],
        hasCustomFontSize && (block.variant.startsWith('h') ? 'tracking-tight' : ''),
        alignmentStyles[block.alignment],
        hasCustomFontWeight && block.fontWeight && fontWeightStyles[block.fontWeight],
        'outline-none transition-all',
        'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground',
        className
      )}
      style={style}
      data-placeholder="Enter text..."
    >
      {block.content}
    </div>
  );
}
