'use client';

import type { PageSection, TextBlock, ImageBlock, ButtonBlock } from '@/lib/waitlist-builder/types';
import { EditableText } from './editable-text';
import { ImageBlockComponent } from './image-block';
import { ButtonBlockComponent } from './button-block';
import { AddElementToolbar } from './add-element-toolbar';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface CustomBlocksRendererProps {
  section: PageSection;
  className?: string;
}

export function CustomBlocksRenderer({ section, className }: CustomBlocksRendererProps) {
  const { isPreviewMode, updateBlock } = useEditorStore();
  const blocks = section.customBlocks || [];

  // Don't render anything if no blocks and in preview mode
  if (blocks.length === 0 && isPreviewMode) {
    return null;
  }

  return (
    <div className={cn('flex flex-col items-center', className)}>
      {blocks.map((block) => {
        if (block.type === 'text') {
          return (
            <EditableText
              key={block.id}
              block={block as TextBlock}
              onUpdate={(updates) => updateBlock(section.id, block.id, updates)}
            />
          );
        }

        if (block.type === 'image') {
          return (
            <ImageBlockComponent
              key={block.id}
              block={block as ImageBlock}
              sectionId={section.id}
            />
          );
        }

        if (block.type === 'button') {
          return (
            <ButtonBlockComponent
              key={block.id}
              block={block as ButtonBlock}
              sectionId={section.id}
            />
          );
        }

        return null;
      })}

      {/* Add element toolbar - only in edit mode */}
      {!isPreviewMode && <AddElementToolbar sectionId={section.id} />}
    </div>
  );
}
