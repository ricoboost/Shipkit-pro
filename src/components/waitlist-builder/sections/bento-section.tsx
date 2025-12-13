'use client';

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { BentoSection as BentoSectionType } from '@/lib/waitlist-builder/types';
import { SectionWrapper } from './section-wrapper';
import { EditableText } from '../blocks/editable-text';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface BentoSectionProps {
  section: BentoSectionType;
}

function getIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || LucideIcons.HelpCircle;
}

export function BentoSection({ section }: BentoSectionProps) {
  const { updateSection, isPreviewMode } = useEditorStore();

  const updateTextBlock = (
    key: 'title' | 'subtitle',
    updates: Record<string, unknown>
  ) => {
    const currentBlock = section.content[key];
    if (!currentBlock) return;

    updateSection<BentoSectionType>(section.id, {
      content: {
        ...section.content,
        [key]: { ...currentBlock, ...updates },
      },
    });
  };

  const updateItem = (itemId: string, updates: Record<string, unknown>) => {
    updateSection<BentoSectionType>(section.id, {
      content: {
        ...section.content,
        items: section.content.items.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        ),
      },
    });
  };

  const gridColsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[section.content.columns];

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-6xl">
        {/* Title & Subtitle */}
        {section.content.title && (
          <EditableText
            block={section.content.title}
            onUpdate={(updates) => updateTextBlock('title', updates)}
            className="mb-4"
          />
        )}
        {section.content.subtitle && (
          <EditableText
            block={section.content.subtitle}
            onUpdate={(updates) => updateTextBlock('subtitle', updates)}
            className="mb-12"
          />
        )}

        {/* Grid */}
        <div className={cn('grid gap-6', gridColsClass)}>
          {section.content.items.map((item) => {
            const Icon = item.icon ? getIcon(item.icon) : null;
            const isItemSelected = useEditorStore.getState().selectedBlockId === item.id;

            const handleItemClick = (e: React.MouseEvent) => {
              if (!isPreviewMode) {
                e.stopPropagation();
                useEditorStore.getState().selectBlock(item.id);
              }
            };

            return (
              <div
                key={item.id}
                onClick={handleItemClick}
                className={cn(
                  'group relative rounded-xl border bg-card p-6 transition-all hover:shadow-lg',
                  item.colSpan === 2 && 'md:col-span-2',
                  item.rowSpan === 2 && 'md:row-span-2',
                  !isPreviewMode && 'cursor-pointer',
                  !isPreviewMode && isItemSelected && 'ring-2 ring-primary ring-offset-2',
                  !isPreviewMode && !isItemSelected && 'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2'
                )}
              >
                {/* Icon */}
                {Icon && (
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                )}

                {/* Image */}
                {item.image && (
                  <div className="mb-4 overflow-hidden rounded-lg">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}

                {/* Title */}
                <h3
                  className={cn(
                    'mb-2 text-lg font-semibold',
                    !isPreviewMode && 'cursor-text hover:bg-muted/50 rounded px-1 -mx-1'
                  )}
                  contentEditable={!isPreviewMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateItem(item.id, { title: e.currentTarget.textContent })
                  }
                >
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className={cn(
                    'text-sm text-muted-foreground',
                    !isPreviewMode && 'cursor-text hover:bg-muted/50 rounded px-1 -mx-1'
                  )}
                  contentEditable={!isPreviewMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateItem(item.id, {
                      description: e.currentTarget.textContent,
                    })
                  }
                >
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
