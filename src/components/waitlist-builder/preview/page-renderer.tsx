'use client';

import type { WaitlistPageConfig, PageSection } from '@/lib/waitlist-builder/types';
import { HeroSection } from '../sections/hero-section';
import { BentoSection } from '../sections/bento-section';
import { HowItWorksSection } from '../sections/how-it-works-section';
import { FooterSection } from '../sections/footer-section';

// Create a mock store context for preview mode
import { useEditorStore } from '../editor/use-editor-state';
import { useEffect } from 'react';

interface PageRendererProps {
  config: WaitlistPageConfig;
}

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

export function PageRenderer({ config }: PageRendererProps) {
  // Set preview mode and config in the store
  useEffect(() => {
    useEditorStore.setState({
      config,
      isPreviewMode: true,
      isLoading: false,
    });
  }, [config]);

  return (
    <main>
      {config.sections
        .filter((section) => section.visible)
        .sort((a, b) => a.order - b.order)
        .map(renderSection)}
    </main>
  );
}
