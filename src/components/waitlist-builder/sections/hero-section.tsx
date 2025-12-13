'use client';

import type { HeroSection as HeroSectionType } from '@/lib/waitlist-builder/types';
import { SectionWrapper } from './section-wrapper';
import { EditableText } from '../blocks/editable-text';
import { SubscribeFormBlockComponent } from '../blocks/subscribe-form-block';
import { useEditorStore } from '../editor/use-editor-state';

interface HeroSectionProps {
  section: HeroSectionType;
}

export function HeroSection({ section }: HeroSectionProps) {
  const { updateSection } = useEditorStore();

  const updateBlock = <K extends keyof HeroSectionType['content']>(
    key: K,
    updates: Record<string, unknown>
  ) => {
    const currentBlock = section.content[key];
    if (!currentBlock || typeof currentBlock !== 'object') return;

    updateSection<HeroSectionType>(section.id, {
      content: {
        ...section.content,
        [key]: { ...(currentBlock as object), ...updates },
      },
    });
  };

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          {section.content.badge && (
            <EditableText
              block={section.content.badge}
              onUpdate={(updates) => updateBlock('badge', updates)}
              className="mb-4 inline-flex items-center rounded-full border px-3 py-1"
            />
          )}

          {/* Headline */}
          <EditableText
            block={section.content.headline}
            onUpdate={(updates) => updateBlock('headline', updates)}
            className="mb-4"
          />

          {/* Subheadline */}
          <EditableText
            block={section.content.subheadline}
            onUpdate={(updates) => updateBlock('subheadline', updates)}
            className="mb-8 max-w-2xl"
          />

          {/* CTA */}
          {section.content.cta.type === 'subscribe-form' ? (
            <SubscribeFormBlockComponent
              block={section.content.cta}
              onUpdate={(updates) => updateBlock('cta', updates)}
              className="mx-auto"
            />
          ) : (
            <div>Button CTA not implemented yet</div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
