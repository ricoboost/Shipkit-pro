'use client';

import { Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import type { FooterSection as FooterSectionType } from '@/lib/waitlist-builder/types';
import { SectionWrapper } from './section-wrapper';
import { useEditorStore } from '../editor/use-editor-state';
import { cn } from '@/lib/utils';

interface FooterSectionProps {
  section: FooterSectionType;
}

export function FooterSection({ section }: FooterSectionProps) {
  const { updateSection, isPreviewMode } = useEditorStore();

  const updateContent = (updates: Partial<FooterSectionType['content']>) => {
    updateSection<FooterSectionType>(section.id, {
      content: {
        ...section.content,
        ...updates,
      },
    });
  };

  const updateLink = (linkId: string, updates: Record<string, unknown>) => {
    updateSection<FooterSectionType>(section.id, {
      content: {
        ...section.content,
        links: section.content.links.map((link) =>
          link.id === linkId ? { ...link, ...updates } : link
        ),
      },
    });
  };

  const socialIcons = {
    twitter: Twitter,
    github: Github,
    linkedin: Linkedin,
    instagram: Instagram,
  };

  return (
    <SectionWrapper section={section}>
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Copyright */}
          <p
            className={cn(
              'text-sm text-muted-foreground',
              !isPreviewMode &&
                'cursor-text hover:bg-muted/50 rounded px-2 py-1'
            )}
            style={{ color: 'hsl(240 5% 64.9%)' }}
            contentEditable={!isPreviewMode}
            suppressContentEditableWarning
            onBlur={(e) =>
              updateContent({ copyright: e.currentTarget.textContent || '' })
            }
          >
            {section.content.copyright}
          </p>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6">
            {section.content.links.map((link) => {
              const isLinkSelected = useEditorStore.getState().selectedBlockId === link.id;

              const handleLinkClick = (e: React.MouseEvent) => {
                if (!isPreviewMode) {
                  e.preventDefault();
                  e.stopPropagation();
                  useEditorStore.getState().selectBlock(link.id);
                }
              };

              return (
                <a
                  key={link.id}
                  href={isPreviewMode ? link.href : '#'}
                  onClick={handleLinkClick}
                  className={cn(
                    'text-sm text-muted-foreground hover:text-foreground transition-colors rounded px-2 py-1',
                    !isPreviewMode && 'cursor-pointer',
                    !isPreviewMode && isLinkSelected && 'ring-2 ring-primary ring-offset-2',
                    !isPreviewMode && !isLinkSelected && 'hover:ring-2 hover:ring-muted-foreground/20 hover:ring-offset-2'
                  )}
                  style={{ color: 'hsl(240 5% 64.9%)' }}
                  contentEditable={!isPreviewMode}
                  suppressContentEditableWarning
                  onBlur={(e) =>
                    updateLink(link.id, { text: e.currentTarget.textContent })
                  }
                >
                  {link.text}
                </a>
              );
            })}
          </nav>

          {/* Social Links */}
          {section.content.showSocial && section.content.socialLinks && (
            <div className="flex items-center gap-4">
              {Object.entries(section.content.socialLinks).map(
                ([platform, url]) => {
                  if (!url) return null;
                  const Icon =
                    socialIcons[platform as keyof typeof socialIcons];
                  if (!Icon) return null;

                  return (
                    <a
                      key={platform}
                      href={isPreviewMode ? url : '#'}
                      onClick={(e) => !isPreviewMode && e.preventDefault()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      style={{ color: 'hsl(240 5% 64.9%)' }}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="sr-only">{platform}</span>
                    </a>
                  );
                }
              )}
            </div>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
