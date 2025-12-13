'use client';

import { useEffect, useRef } from 'react';
import { useEditorStore } from './use-editor-state';
import { HeroSection } from '../sections/hero-section';
import { BentoSection } from '../sections/bento-section';
import { HowItWorksSection } from '../sections/how-it-works-section';
import { FooterSection } from '../sections/footer-section';
import type { PageSection } from '@/lib/waitlist-builder/types';
import { cn } from '@/lib/utils';

function renderSection(section: PageSection) {
  switch (section.type) {
    case 'hero':
      return <HeroSection key={section.id} section={section} />;
    case 'bento':
      return <BentoSection key={section.id} section={section} />;
    case 'how-it-works':
      return <HowItWorksSection key={section.id} section={section} />;
    case 'footer':
      return <FooterSection key={section.id} section={section} />;
    default:
      return null;
  }
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function EditorCanvas() {
  const { config, isPreviewMode, selectSection, selectedSectionId } = useEditorStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to selected section when it changes
  useEffect(() => {
    if (selectedSectionId && scrollContainerRef.current) {
      const sectionElement = scrollContainerRef.current.querySelector(
        `[data-section-id="${selectedSectionId}"]`
      );
      if (sectionElement) {
        sectionElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }
    }
  }, [selectedSectionId]);

  const handleCanvasClick = () => {
    if (!isPreviewMode) {
      selectSection(null);
    }
  };

  return (
    <div
      ref={scrollContainerRef}
      className={cn(
        'flex-1 overflow-auto',
        isPreviewMode ? 'bg-background' : 'bg-muted/50'
      )}
      onClick={handleCanvasClick}
    >
      <div
        className={cn(
          'min-h-full',
          !isPreviewMode && 'mx-auto shadow-xl bg-background',
          !isPreviewMode && maxWidthClasses[config.globalStyles.maxWidth]
        )}
      >
        {config.sections
          .filter((section) => section.visible || !isPreviewMode)
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <div key={section.id} data-section-id={section.id}>
              {renderSection(section)}
            </div>
          ))}

        {config.sections.length === 0 && (
          <div className="flex h-96 items-center justify-center">
            <p className="text-muted-foreground">
              No sections yet. Add a section from the sidebar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
