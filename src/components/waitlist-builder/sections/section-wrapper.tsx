'use client';

import { cn } from '@/lib/utils';
import type { PageSection, BackgroundConfig } from '@/lib/waitlist-builder/types';
import { useEditorStore } from '../editor/use-editor-state';
import { CustomBlocksRenderer } from '../blocks/custom-blocks-renderer';

interface SectionWrapperProps {
  section: PageSection;
  children: React.ReactNode;
  className?: string;
}

function getBackgroundStyle(background: BackgroundConfig): React.CSSProperties {
  switch (background.type) {
    case 'color':
      return {
        backgroundColor: background.color
          ? `hsl(${background.color})`
          : undefined,
      };
    case 'gradient':
      if (!background.gradient) return {};
      const { from, to, direction } = background.gradient;
      const gradientMap: Record<string, string> = {
        'to-r': 'to right',
        'to-l': 'to left',
        'to-t': 'to top',
        'to-b': 'to bottom',
        'to-br': 'to bottom right',
        'to-bl': 'to bottom left',
        'to-tr': 'to top right',
        'to-tl': 'to top left',
      };
      return {
        background: `linear-gradient(${gradientMap[direction]}, hsl(${from}), hsl(${to}))`,
      };
    case 'image':
      if (!background.image) return {};
      const { url, overlay, position, size } = background.image;
      return {
        backgroundImage: overlay
          ? `linear-gradient(hsl(${overlay}), hsl(${overlay})), url(${url})`
          : `url(${url})`,
        backgroundPosition: position,
        backgroundSize: size,
        backgroundRepeat: 'no-repeat',
      };
    default:
      return {};
  }
}

export function SectionWrapper({
  section,
  children,
  className,
}: SectionWrapperProps) {
  const { selectedSectionId, isPreviewMode, selectSection } = useEditorStore();
  const isSelected = selectedSectionId === section.id;

  if (!section.visible && isPreviewMode) {
    return null;
  }

  const backgroundStyle = getBackgroundStyle(section.background);
  const spacingStyle: React.CSSProperties = {
    paddingTop: section.spacing.paddingTop,
    paddingBottom: section.spacing.paddingBottom,
    paddingLeft: section.spacing.paddingLeft,
    paddingRight: section.spacing.paddingRight,
    minHeight: section.minHeight ? `${section.minHeight}vh` : undefined,
  };

  return (
    <section
      onClick={(e) => {
        if (!isPreviewMode) {
          e.stopPropagation();
          selectSection(section.id);
        }
      }}
      className={cn(
        'relative transition-all',
        !section.visible && 'opacity-50',
        !isPreviewMode && 'cursor-pointer',
        !isPreviewMode &&
          isSelected &&
          'ring-2 ring-primary ring-offset-2 ring-offset-background',
        !isPreviewMode &&
          !isSelected &&
          'hover:ring-2 hover:ring-muted-foreground/20',
        className
      )}
      style={{
        ...backgroundStyle,
        ...spacingStyle,
      }}
    >
      {/* Section type label */}
      {!isPreviewMode && isSelected && (
        <div className="absolute -top-3 left-4 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          {section.type}
        </div>
      )}

      {/* Custom CSS injection */}
      {section.customCSS && (
        <style
          dangerouslySetInnerHTML={{
            __html: `[data-section-id="${section.id}"] { ${section.customCSS} }`,
          }}
        />
      )}

      <div data-section-id={section.id}>
        {children}
        {/* Custom insertable blocks */}
        <CustomBlocksRenderer section={section} className="mt-6" />
      </div>
    </section>
  );
}
