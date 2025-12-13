'use client';

import * as LucideIcons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { HowItWorksSection as HowItWorksSectionType } from '@/lib/waitlist-builder/types';
import { SectionWrapper } from './section-wrapper';
import { EditableText } from '../blocks/editable-text';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface HowItWorksSectionProps {
  section: HowItWorksSectionType;
}

function getIcon(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon>;
  return icons[iconName] || LucideIcons.HelpCircle;
}

export function HowItWorksSection({ section }: HowItWorksSectionProps) {
  const { updateSection, isPreviewMode } = useEditorStore();

  const updateTextBlock = (
    key: 'title' | 'subtitle',
    updates: Record<string, unknown>
  ) => {
    const currentBlock = section.content[key];
    if (!currentBlock) return;

    updateSection<HowItWorksSectionType>(section.id, {
      content: {
        ...section.content,
        [key]: { ...currentBlock, ...updates },
      },
    });
  };

  const updateStep = (stepId: string, updates: Record<string, unknown>) => {
    updateSection<HowItWorksSectionType>(section.id, {
      content: {
        ...section.content,
        steps: section.content.steps.map((step) =>
          step.id === stepId ? { ...step, ...updates } : step
        ),
      },
    });
  };

  const isHorizontal = section.content.layout === 'horizontal';

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

        {/* Steps */}
        <div
          className={cn(
            'relative',
            isHorizontal
              ? 'grid gap-8 md:grid-cols-3'
              : 'flex flex-col gap-8 max-w-2xl mx-auto'
          )}
        >
          {/* Connection line */}
          {isHorizontal && section.content.steps.length > 1 && (
            <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-border md:block" />
          )}

          {section.content.steps.map((step, index) => {
            const Icon = step.icon ? getIcon(step.icon) : null;
            const isStepSelected = useEditorStore.getState().selectedBlockId === step.id;

            const handleStepClick = (e: React.MouseEvent) => {
              if (!isPreviewMode) {
                e.stopPropagation();
                useEditorStore.getState().selectBlock(step.id);
              }
            };

            return (
              <div
                key={step.id}
                onClick={handleStepClick}
                className={cn(
                  'relative rounded-lg p-2 -m-2 transition-all',
                  isHorizontal ? 'text-center' : 'flex gap-6',
                  !isPreviewMode && 'cursor-pointer',
                  !isPreviewMode && isStepSelected && 'ring-2 ring-primary ring-offset-2',
                  !isPreviewMode && !isStepSelected && 'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2'
                )}
              >
                {/* Step number/icon */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground',
                    isHorizontal
                      ? 'mx-auto mb-4 h-12 w-12'
                      : 'h-10 w-10 shrink-0'
                  )}
                >
                  {Icon ? (
                    <Icon className="h-5 w-5" />
                  ) : (
                    <span className="text-lg font-bold">{step.number}</span>
                  )}
                </div>

                {/* Content */}
                <div className={cn(!isHorizontal && 'flex-1 pb-8')}>
                  {/* Vertical line */}
                  {!isHorizontal &&
                    index < section.content.steps.length - 1 && (
                      <div className="absolute left-5 top-12 h-full w-0.5 -translate-x-1/2 bg-border" />
                    )}

                  <h3
                    className={cn(
                      'mb-2 text-xl font-semibold',
                      !isPreviewMode &&
                        'cursor-text hover:bg-muted/50 rounded px-1 -mx-1'
                    )}
                    contentEditable={!isPreviewMode}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      updateStep(step.id, {
                        title: e.currentTarget.textContent,
                      })
                    }
                  >
                    {step.title}
                  </h3>

                  <p
                    className={cn(
                      'text-muted-foreground',
                      !isPreviewMode &&
                        'cursor-text hover:bg-muted/50 rounded px-1 -mx-1'
                    )}
                    contentEditable={!isPreviewMode}
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      updateStep(step.id, {
                        description: e.currentTarget.textContent,
                      })
                    }
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
}
