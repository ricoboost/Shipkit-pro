'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import type { SubscribeFormBlock } from '@/lib/waitlist-builder/types';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface SubscribeFormBlockProps {
  block: SubscribeFormBlock;
  onUpdate: (updates: Partial<SubscribeFormBlock>) => void;
  className?: string;
}

export function SubscribeFormBlockComponent({
  block,
  onUpdate,
  className,
}: SubscribeFormBlockProps) {
  const { isPreviewMode, selectedBlockId, selectBlock } = useEditorStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelected = selectedBlockId === block.id;
  const isStacked = block.layout === 'stacked';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: block.source,
          tags: block.tags,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to subscribe');
      }

      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isPreviewMode) {
      e.stopPropagation();
      selectBlock(block.id);
    }
  };

  // Build input styles
  const inputStyle: React.CSSProperties = {
    backgroundColor: block.inputStyle?.backgroundColor
      ? `hsl(${block.inputStyle.backgroundColor})`
      : undefined,
    color: block.inputStyle?.textColor
      ? `hsl(${block.inputStyle.textColor})`
      : undefined,
    borderColor: block.inputStyle?.borderColor
      ? `hsl(${block.inputStyle.borderColor})`
      : undefined,
    borderRadius: block.inputStyle?.borderRadius
      ? `${block.inputStyle.borderRadius}px`
      : undefined,
    borderWidth: block.inputStyle?.borderWidth
      ? `${block.inputStyle.borderWidth}px`
      : undefined,
    fontSize: block.inputStyle?.fontSize
      ? `${block.inputStyle.fontSize}px`
      : undefined,
    height: block.inputStyle?.height
      ? `${block.inputStyle.height}px`
      : undefined,
    width: block.inputStyle?.width || undefined,
  };

  // Build button styles
  const buttonStyle: React.CSSProperties = {
    backgroundColor: block.buttonStyle?.backgroundColor
      ? `hsl(${block.buttonStyle.backgroundColor})`
      : undefined,
    color: block.buttonStyle?.textColor
      ? `hsl(${block.buttonStyle.textColor})`
      : undefined,
    borderRadius: block.buttonStyle?.borderRadius
      ? `${block.buttonStyle.borderRadius}px`
      : undefined,
    fontSize: block.buttonStyle?.fontSize
      ? `${block.buttonStyle.fontSize}px`
      : undefined,
    paddingLeft: block.buttonStyle?.paddingX
      ? `${block.buttonStyle.paddingX}px`
      : undefined,
    paddingRight: block.buttonStyle?.paddingX
      ? `${block.buttonStyle.paddingX}px`
      : undefined,
    paddingTop: block.buttonStyle?.paddingY
      ? `${block.buttonStyle.paddingY}px`
      : undefined,
    paddingBottom: block.buttonStyle?.paddingY
      ? `${block.buttonStyle.paddingY}px`
      : undefined,
  };

  // Container styles
  const containerStyle: React.CSSProperties = {
    gap: block.gap ? `${block.gap}px` : undefined,
    maxWidth: block.dimensions?.maxWidth || undefined,
    width: block.dimensions?.width || undefined,
    marginTop: block.spacing?.marginTop
      ? `${block.spacing.marginTop}px`
      : undefined,
    marginBottom: block.spacing?.marginBottom
      ? `${block.spacing.marginBottom}px`
      : undefined,
  };

  // Success state
  if (isSuccess) {
    return (
      <div
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg bg-primary/10 p-4',
          className
        )}
        style={containerStyle}
      >
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <p className="text-sm font-medium">{block.successMessage}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={handleClick}
      className={cn(
        'flex w-full',
        isStacked ? 'flex-col' : 'flex-col sm:flex-row',
        !block.dimensions?.maxWidth && 'max-w-md',
        !isPreviewMode &&
          isSelected &&
          'ring-2 ring-primary ring-offset-2 rounded-lg',
        !isPreviewMode &&
          !isSelected &&
          'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2 rounded-lg',
        className
      )}
      style={containerStyle}
    >
      <input
        type="email"
        placeholder={block.placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={isLoading || (!isPreviewMode && !isSelected)}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          !isStacked && 'flex-1'
        )}
        style={inputStyle}
      />
      <button
        type="submit"
        disabled={isLoading || !isPreviewMode}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium',
          'ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'h-10 px-4 py-2 shrink-0'
        )}
        style={buttonStyle}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        {block.buttonText}
      </button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
