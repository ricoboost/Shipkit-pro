'use client';

import { useEditorStore } from './use-editor-state';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/admin/color-picker';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import type {
  PageSection,
  BackgroundConfig,
  TextBlock,
  ImageBlock,
  ButtonBlock,
  SubscribeFormBlock,
  HeroSection,
  BentoSection,
  BentoGridItem,
  HowItWorksSection,
  HowItWorksStep,
  FooterSection,
  FooterLink,
  TextVariant,
  TextAlignment,
  FontWeight,
  ButtonVariant,
  ButtonSize,
} from '@/lib/waitlist-builder/types';
import { sectionTemplates } from '@/lib/waitlist-builder/defaults';

export function EditorSidebar() {
  const {
    config,
    selectedSectionId,
    selectedBlockId,
    isPreviewMode,
    metaTitle,
    metaDescription,
    updateSection: _updateSection,
    setMetaTitle,
    setMetaDescription,
  } = useEditorStore();

  if (isPreviewMode) {
    return null;
  }

  const selectedSection = selectedSectionId
    ? config.sections.find((s) => s.id === selectedSectionId)
    : null;

  // Determine the default tab
  const defaultTab = selectedBlockId ? 'element' : selectedSection ? 'section' : 'page';

  return (
    <div className="w-80 border-l bg-background overflow-y-auto">
      <Tabs defaultValue={defaultTab} key={`${selectedSectionId}-${selectedBlockId}`} className="h-full">
        <TabsList className="w-full rounded-none border-b">
          <TabsTrigger value="element" className="flex-1">
            Element
          </TabsTrigger>
          <TabsTrigger value="section" className="flex-1">
            Section
          </TabsTrigger>
          <TabsTrigger value="page" className="flex-1">
            Page
          </TabsTrigger>
        </TabsList>

        {/* Element Properties */}
        <TabsContent value="element" className="p-4 space-y-6">
          {selectedSection && selectedBlockId ? (
            <ElementProperties section={selectedSection} blockId={selectedBlockId} />
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              Click on an element to edit its properties
            </div>
          )}
        </TabsContent>

        {/* Section Properties */}
        <TabsContent value="section" className="p-4 space-y-6">
          {selectedSection ? (
            <SectionProperties section={selectedSection} />
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              Select a section to edit its properties
            </div>
          )}
        </TabsContent>

        {/* Page Properties */}
        <TabsContent value="page" className="p-4 space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">SEO Settings</h3>

            <div className="space-y-2">
              <Label>Meta Title</Label>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Page title for search engines"
              />
            </div>

            <div className="space-y-2">
              <Label>Meta Description</Label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Brief description for search engines"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Global Styles</h3>

            <div className="space-y-2">
              <Label>Max Width</Label>
              <Select
                value={config.globalStyles.maxWidth}
                onValueChange={(value) => {
                  useEditorStore.getState().setConfig({
                    ...config,
                    globalStyles: {
                      ...config.globalStyles,
                      maxWidth: value as typeof config.globalStyles.maxWidth,
                    },
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small (640px)</SelectItem>
                  <SelectItem value="md">Medium (768px)</SelectItem>
                  <SelectItem value="lg">Large (1024px)</SelectItem>
                  <SelectItem value="xl">Extra Large (1280px)</SelectItem>
                  <SelectItem value="2xl">2XL (1536px)</SelectItem>
                  <SelectItem value="full">Full Width</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface SectionPropertiesProps {
  section: PageSection;
}

function SectionProperties({ section }: SectionPropertiesProps) {
  const { updateSection } = useEditorStore();
  const template = sectionTemplates[section.type];

  const handleBackgroundChange = (updates: Partial<BackgroundConfig>) => {
    updateSection(section.id, {
      background: { ...section.background, ...updates },
    });
  };

  const handleSpacingChange = (key: string, value: number) => {
    updateSection(section.id, {
      spacing: { ...section.spacing, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      {/* Section Type Header */}
      <div>
        <h3 className="font-semibold">{template.name}</h3>
        <p className="text-sm text-muted-foreground">{template.description}</p>
      </div>

      {/* Background */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Background</h4>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={section.background.type}
            onValueChange={(value: BackgroundConfig['type']) =>
              handleBackgroundChange({ type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="color">Solid Color</SelectItem>
              <SelectItem value="gradient">Gradient</SelectItem>
              <SelectItem value="image">Image</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {section.background.type === 'color' && (
          <ColorPicker
            label="Color"
            value={section.background.color || '0 0% 100%'}
            onChange={(color) => handleBackgroundChange({ color })}
          />
        )}

        {section.background.type === 'gradient' && (
          <>
            <ColorPicker
              label="From"
              value={section.background.gradient?.from || '0 0% 100%'}
              onChange={(from) =>
                handleBackgroundChange({
                  gradient: { ...section.background.gradient!, from },
                })
              }
            />
            <ColorPicker
              label="To"
              value={section.background.gradient?.to || '0 0% 0%'}
              onChange={(to) =>
                handleBackgroundChange({
                  gradient: { ...section.background.gradient!, to },
                })
              }
            />
            <div className="space-y-2">
              <Label>Direction</Label>
              <Select
                value={section.background.gradient?.direction || 'to-b'}
                onValueChange={(direction) =>
                  handleBackgroundChange({
                    gradient: {
                      from: section.background.gradient?.from || '0 0% 100%',
                      to: section.background.gradient?.to || '0 0% 0%',
                      direction: direction as NonNullable<BackgroundConfig['gradient']>['direction'],
                    },
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="to-r">Left to Right</SelectItem>
                  <SelectItem value="to-l">Right to Left</SelectItem>
                  <SelectItem value="to-t">Bottom to Top</SelectItem>
                  <SelectItem value="to-b">Top to Bottom</SelectItem>
                  <SelectItem value="to-br">Top-Left to Bottom-Right</SelectItem>
                  <SelectItem value="to-bl">Top-Right to Bottom-Left</SelectItem>
                  <SelectItem value="to-tr">Bottom-Left to Top-Right</SelectItem>
                  <SelectItem value="to-tl">Bottom-Right to Top-Left</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {section.background.type === 'image' && (
          <div className="space-y-2">
            <Label>Image URL</Label>
            <Input
              value={section.background.image?.url || ''}
              onChange={(e) =>
                handleBackgroundChange({
                  image: {
                    ...section.background.image!,
                    url: e.target.value,
                    position: section.background.image?.position || 'center',
                    size: section.background.image?.size || 'cover',
                  },
                })
              }
              placeholder="https://example.com/image.jpg"
            />
          </div>
        )}
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Spacing</h4>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Padding Top</Label>
              <span className="text-muted-foreground">
                {section.spacing.paddingTop}px
              </span>
            </div>
            <Slider
              value={[section.spacing.paddingTop]}
              min={0}
              max={200}
              step={8}
              onValueChange={([value]) =>
                handleSpacingChange('paddingTop', value)
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Padding Bottom</Label>
              <span className="text-muted-foreground">
                {section.spacing.paddingBottom}px
              </span>
            </div>
            <Slider
              value={[section.spacing.paddingBottom]}
              min={0}
              max={200}
              step={8}
              onValueChange={([value]) =>
                handleSpacingChange('paddingBottom', value)
              }
            />
          </div>
        </div>
      </div>

      {/* Min Height */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Size</h4>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Min Height</Label>
            <span className="text-muted-foreground">
              {section.minHeight || 0}vh
            </span>
          </div>
          <Slider
            value={[section.minHeight || 0]}
            min={0}
            max={100}
            step={5}
            onValueChange={([value]) =>
              updateSection(section.id, { minHeight: value || undefined })
            }
          />
        </div>
      </div>

      {/* Custom CSS */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Custom CSS</h4>
        <Textarea
          value={section.customCSS || ''}
          onChange={(e) =>
            updateSection(section.id, { customCSS: e.target.value })
          }
          placeholder="/* Add custom CSS here */&#10;color: red;&#10;font-size: 20px;"
          rows={5}
          className="font-mono text-xs"
        />
        <p className="text-xs text-muted-foreground">
          CSS will be applied to this section only.
        </p>
      </div>
    </div>
  );
}

// ============== ELEMENT PROPERTIES ==============

interface ElementPropertiesProps {
  section: PageSection;
  blockId: string;
}

function ElementProperties({ section, blockId }: ElementPropertiesProps) {
  const { updateSection, updateBlock, removeBlock, selectBlock } = useEditorStore();

  // Type for finding blocks
  type BlockResult = {
    block: TextBlock | ImageBlock | ButtonBlock | SubscribeFormBlock | null;
    key: string | null;
    blockType: 'text' | 'image' | 'button' | 'subscribe-form' | 'bento-item' | 'step' | 'footer-link' | 'custom-block' | null;
    itemId?: string;
  };

  // Find the block within the section
  const findBlock = (): BlockResult => {
    // First check customBlocks
    if (section.customBlocks) {
      const customBlock = section.customBlocks.find(b => b.id === blockId);
      if (customBlock) {
        return { block: customBlock, key: 'customBlocks', blockType: 'custom-block', itemId: customBlock.id };
      }
    }

    if (section.type === 'hero') {
      const hero = section as HeroSection;
      if (hero.content.headline?.id === blockId) return { block: hero.content.headline, key: 'headline', blockType: 'text' };
      if (hero.content.subheadline?.id === blockId) return { block: hero.content.subheadline, key: 'subheadline', blockType: 'text' };
      if (hero.content.badge?.id === blockId) return { block: hero.content.badge, key: 'badge', blockType: 'text' };
      if (hero.content.cta?.id === blockId) return { block: hero.content.cta as SubscribeFormBlock, key: 'cta', blockType: 'subscribe-form' };
    }
    if (section.type === 'bento') {
      const bento = section as BentoSection;
      if (bento.content.title?.id === blockId) return { block: bento.content.title, key: 'title', blockType: 'text' };
      if (bento.content.subtitle?.id === blockId) return { block: bento.content.subtitle, key: 'subtitle', blockType: 'text' };
      // Check bento items
      const bentoItem = bento.content.items.find(item => item.id === blockId);
      if (bentoItem) return { block: null, key: 'items', blockType: 'bento-item', itemId: bentoItem.id };
    }
    if (section.type === 'how-it-works') {
      const hiw = section as HowItWorksSection;
      if (hiw.content.title?.id === blockId) return { block: hiw.content.title, key: 'title', blockType: 'text' };
      if (hiw.content.subtitle?.id === blockId) return { block: hiw.content.subtitle, key: 'subtitle', blockType: 'text' };
      // Check steps
      const step = hiw.content.steps.find(s => s.id === blockId);
      if (step) return { block: null, key: 'steps', blockType: 'step', itemId: step.id };
    }
    if (section.type === 'footer') {
      const footer = section as FooterSection;
      // Check links
      const link = footer.content.links.find(l => l.id === blockId);
      if (link) return { block: null, key: 'links', blockType: 'footer-link', itemId: link.id };
    }
    return { block: null, key: null, blockType: null };
  };

  const { block, key, blockType, itemId } = findBlock();

  if (!blockType) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        Element not found
      </div>
    );
  }

  const updateSectionBlock = (updates: Record<string, unknown>) => {
    if (section.type === 'hero' && block && key) {
      const hero = section as HeroSection;
      updateSection<HeroSection>(section.id, {
        content: {
          ...hero.content,
          [key]: { ...block, ...updates },
        },
      });
    } else if (section.type === 'bento' && block && key) {
      const bento = section as BentoSection;
      updateSection<BentoSection>(section.id, {
        content: {
          ...bento.content,
          [key]: { ...block, ...updates },
        },
      });
    } else if (section.type === 'how-it-works' && block && key) {
      const hiw = section as HowItWorksSection;
      updateSection<HowItWorksSection>(section.id, {
        content: {
          ...hiw.content,
          [key]: { ...block, ...updates },
        },
      });
    }
  };

  // All elements are deletable
  const isDeletable = true;

  // Delete handler
  const handleDelete = () => {
    if (blockType === 'custom-block' && itemId) {
      removeBlock(section.id, itemId);
      selectBlock(null);
    } else if (blockType === 'bento-item' && itemId) {
      const bento = section as BentoSection;
      updateSection<BentoSection>(section.id, {
        content: {
          ...bento.content,
          items: bento.content.items.filter(i => i.id !== itemId),
        },
      });
      selectBlock(null);
    } else if (blockType === 'step' && itemId) {
      const hiw = section as HowItWorksSection;
      updateSection<HowItWorksSection>(section.id, {
        content: {
          ...hiw.content,
          steps: hiw.content.steps.filter(s => s.id !== itemId),
        },
      });
      selectBlock(null);
    } else if (blockType === 'footer-link' && itemId) {
      const footer = section as FooterSection;
      updateSection<FooterSection>(section.id, {
        content: {
          ...footer.content,
          links: footer.content.links.filter(l => l.id !== itemId),
        },
      });
      selectBlock(null);
    } else if (blockType === 'text' && key) {
      // Delete built-in text blocks (headline, subheadline, badge, title, subtitle)
      if (section.type === 'hero') {
        const hero = section as HeroSection;
        updateSection<HeroSection>(section.id, {
          content: {
            ...hero.content,
            [key]: undefined,
          },
        });
      } else if (section.type === 'bento') {
        const bento = section as BentoSection;
        updateSection<BentoSection>(section.id, {
          content: {
            ...bento.content,
            [key]: undefined,
          },
        });
      } else if (section.type === 'how-it-works') {
        const hiw = section as HowItWorksSection;
        updateSection<HowItWorksSection>(section.id, {
          content: {
            ...hiw.content,
            [key]: undefined,
          },
        });
      }
      selectBlock(null);
    } else if (blockType === 'subscribe-form' && key) {
      // Delete subscribe form (cta)
      if (section.type === 'hero') {
        const hero = section as HeroSection;
        updateSection<HeroSection>(section.id, {
          content: {
            ...hero.content,
            [key]: undefined,
          },
        });
      }
      selectBlock(null);
    }
  };

  // Delete button component
  const DeleteButton = isDeletable ? (
    <div className="flex justify-end mb-4">
      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </Button>
    </div>
  ) : null;

  // Render based on block type
  if (blockType === 'text' && block) {
    return (
      <>
        {DeleteButton}
        <TextBlockProperties block={block as TextBlock} onUpdate={updateSectionBlock} />
      </>
    );
  }

  if (blockType === 'subscribe-form' && block) {
    return (
      <>
        {DeleteButton}
        <SubscribeFormProperties block={block as SubscribeFormBlock} onUpdate={updateSectionBlock} />
      </>
    );
  }

  // Handle custom blocks (inserted by user)
  if (blockType === 'custom-block' && block && itemId) {
    if (block.type === 'text') {
      return (
        <>
          {DeleteButton}
          <TextBlockProperties
            block={block as TextBlock}
            onUpdate={(updates) => updateBlock(section.id, itemId, updates)}
          />
        </>
      );
    }
    if (block.type === 'image') {
      return (
        <>
          {DeleteButton}
          <ImageBlockProperties
            block={block as ImageBlock}
            onUpdate={(updates) => updateBlock(section.id, itemId, updates)}
          />
        </>
      );
    }
    if (block.type === 'button') {
      return (
        <>
          {DeleteButton}
          <ButtonBlockProperties
            block={block as ButtonBlock}
            onUpdate={(updates) => updateBlock(section.id, itemId, updates)}
          />
        </>
      );
    }
  }

  if (blockType === 'bento-item' && itemId) {
    const bento = section as BentoSection;
    const item = bento.content.items.find(i => i.id === itemId);
    if (item) {
      return (
        <>
          {DeleteButton}
          <BentoItemProperties
            item={item}
            onUpdate={(updates) => {
              updateSection<BentoSection>(section.id, {
                content: {
                  ...bento.content,
                  items: bento.content.items.map(i =>
                    i.id === itemId ? { ...i, ...updates } : i
                  ),
                },
              });
            }}
          />
        </>
      );
    }
  }

  if (blockType === 'step' && itemId) {
    const hiw = section as HowItWorksSection;
    const step = hiw.content.steps.find(s => s.id === itemId);
    if (step) {
      return (
        <>
          {DeleteButton}
          <StepProperties
            step={step}
            onUpdate={(updates) => {
              updateSection<HowItWorksSection>(section.id, {
                content: {
                  ...hiw.content,
                  steps: hiw.content.steps.map(s =>
                    s.id === itemId ? { ...s, ...updates } : s
                  ),
                },
              });
            }}
          />
        </>
      );
    }
  }

  if (blockType === 'footer-link' && itemId) {
    const footer = section as FooterSection;
    const link = footer.content.links.find(l => l.id === itemId);
    if (link) {
      return (
        <>
          {DeleteButton}
          <FooterLinkProperties
            link={link}
            onUpdate={(updates) => {
              updateSection<FooterSection>(section.id, {
                content: {
                  ...footer.content,
                  links: footer.content.links.map(l =>
                    l.id === itemId ? { ...l, ...updates } : l
                  ),
                },
              });
            }}
          />
        </>
      );
    }
  }

  return (
    <div className="text-center text-sm text-muted-foreground py-8">
      Element type not editable yet
    </div>
  );
}

// ============== TEXT BLOCK PROPERTIES ==============

interface TextBlockPropertiesProps {
  block: TextBlock;
  onUpdate: (updates: Record<string, unknown>) => void;
}

function TextBlockProperties({ block, onUpdate }: TextBlockPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Text Element</h3>
        <p className="text-sm text-muted-foreground">Edit text styling</p>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Typography</h4>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={block.variant}
            onValueChange={(value: TextVariant) => onUpdate({ variant: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="h1">Heading 1</SelectItem>
              <SelectItem value="h2">Heading 2</SelectItem>
              <SelectItem value="h3">Heading 3</SelectItem>
              <SelectItem value="h4">Heading 4</SelectItem>
              <SelectItem value="p">Paragraph</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="muted">Muted</SelectItem>
              <SelectItem value="small">Small</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Alignment</Label>
          <Select
            value={block.alignment}
            onValueChange={(value: TextAlignment) => onUpdate({ alignment: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Font Weight</Label>
          <Select
            value={block.fontWeight || 'normal'}
            onValueChange={(value: FontWeight) => onUpdate({ fontWeight: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">Normal</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="semibold">Semi Bold</SelectItem>
              <SelectItem value="bold">Bold</SelectItem>
              <SelectItem value="extrabold">Extra Bold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Font Size</Label>
            <span className="text-muted-foreground">
              {block.fontSize || 'auto'}px
            </span>
          </div>
          <Slider
            value={[block.fontSize || 16]}
            min={10}
            max={96}
            step={1}
            onValueChange={([value]) => onUpdate({ fontSize: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Line Height</Label>
            <span className="text-muted-foreground">
              {block.lineHeight || 1.5}
            </span>
          </div>
          <Slider
            value={[block.lineHeight || 1.5]}
            min={1}
            max={3}
            step={0.1}
            onValueChange={([value]) => onUpdate({ lineHeight: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Letter Spacing</Label>
            <span className="text-muted-foreground">
              {block.letterSpacing || 0}px
            </span>
          </div>
          <Slider
            value={[block.letterSpacing || 0]}
            min={-2}
            max={10}
            step={0.5}
            onValueChange={([value]) => onUpdate({ letterSpacing: value })}
          />
        </div>

        <ColorPicker
          label="Text Color"
          value={block.color || '0 0% 0%'}
          onChange={(color) => onUpdate({ color })}
        />
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Dimensions</h4>

        <div className="space-y-2">
          <Label>Max Width</Label>
          <Input
            value={block.dimensions?.maxWidth || ''}
            onChange={(e) =>
              onUpdate({
                dimensions: { ...block.dimensions, maxWidth: e.target.value },
              })
            }
            placeholder="e.g., 600px, 100%, 40rem"
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin Top</Label>
              <span className="text-muted-foreground text-xs">
                {block.spacing?.marginTop || 0}px
              </span>
            </div>
            <Slider
              value={[block.spacing?.marginTop || 0]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) =>
                onUpdate({ spacing: { ...block.spacing, marginTop: value } })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin Bottom</Label>
              <span className="text-muted-foreground text-xs">
                {block.spacing?.marginBottom || 0}px
              </span>
            </div>
            <Slider
              value={[block.spacing?.marginBottom || 0]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) =>
                onUpdate({ spacing: { ...block.spacing, marginBottom: value } })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== SUBSCRIBE FORM PROPERTIES ==============

interface SubscribeFormPropertiesProps {
  block: SubscribeFormBlock;
  onUpdate: (updates: Record<string, unknown>) => void;
}

function SubscribeFormProperties({ block, onUpdate }: SubscribeFormPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Subscribe Form</h3>
        <p className="text-sm text-muted-foreground">Customize form appearance</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Content</h4>

        <div className="space-y-2">
          <Label>Placeholder</Label>
          <Input
            value={block.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={block.buttonText}
            onChange={(e) => onUpdate({ buttonText: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Success Message</Label>
          <Input
            value={block.successMessage}
            onChange={(e) => onUpdate({ successMessage: e.target.value })}
          />
        </div>
      </div>

      {/* Layout */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Layout</h4>

        <div className="space-y-2">
          <Label>Style</Label>
          <Select
            value={block.layout || 'inline'}
            onValueChange={(value: 'inline' | 'stacked') => onUpdate({ layout: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inline">Inline</SelectItem>
              <SelectItem value="stacked">Stacked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Gap</Label>
            <span className="text-muted-foreground">{block.gap || 8}px</span>
          </div>
          <Slider
            value={[block.gap || 8]}
            min={0}
            max={32}
            step={4}
            onValueChange={([value]) => onUpdate({ gap: value })}
          />
        </div>
      </div>

      {/* Input Styling */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Input Styling</h4>

        <ColorPicker
          label="Background"
          value={block.inputStyle?.backgroundColor || '0 0% 100%'}
          onChange={(backgroundColor) =>
            onUpdate({ inputStyle: { ...block.inputStyle, backgroundColor } })
          }
        />

        <ColorPicker
          label="Text Color"
          value={block.inputStyle?.textColor || '0 0% 0%'}
          onChange={(textColor) =>
            onUpdate({ inputStyle: { ...block.inputStyle, textColor } })
          }
        />

        <ColorPicker
          label="Border Color"
          value={block.inputStyle?.borderColor || '0 0% 80%'}
          onChange={(borderColor) =>
            onUpdate({ inputStyle: { ...block.inputStyle, borderColor } })
          }
        />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Border Radius</Label>
            <span className="text-muted-foreground">
              {block.inputStyle?.borderRadius || 6}px
            </span>
          </div>
          <Slider
            value={[block.inputStyle?.borderRadius || 6]}
            min={0}
            max={24}
            step={2}
            onValueChange={([borderRadius]) =>
              onUpdate({ inputStyle: { ...block.inputStyle, borderRadius } })
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Height</Label>
            <span className="text-muted-foreground">
              {block.inputStyle?.height || 40}px
            </span>
          </div>
          <Slider
            value={[block.inputStyle?.height || 40]}
            min={32}
            max={64}
            step={4}
            onValueChange={([height]) =>
              onUpdate({ inputStyle: { ...block.inputStyle, height } })
            }
          />
        </div>

        <div className="space-y-2">
          <Label>Width</Label>
          <Input
            value={block.inputStyle?.width || ''}
            onChange={(e) =>
              onUpdate({ inputStyle: { ...block.inputStyle, width: e.target.value } })
            }
            placeholder="e.g., 300px, 100%"
          />
        </div>
      </div>

      {/* Button Styling */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Button Styling</h4>

        <ColorPicker
          label="Background"
          value={block.buttonStyle?.backgroundColor || '222.2 47.4% 11.2%'}
          onChange={(backgroundColor) =>
            onUpdate({ buttonStyle: { ...block.buttonStyle, backgroundColor } })
          }
        />

        <ColorPicker
          label="Text Color"
          value={block.buttonStyle?.textColor || '0 0% 100%'}
          onChange={(textColor) =>
            onUpdate({ buttonStyle: { ...block.buttonStyle, textColor } })
          }
        />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Border Radius</Label>
            <span className="text-muted-foreground">
              {block.buttonStyle?.borderRadius || 6}px
            </span>
          </div>
          <Slider
            value={[block.buttonStyle?.borderRadius || 6]}
            min={0}
            max={24}
            step={2}
            onValueChange={([borderRadius]) =>
              onUpdate({ buttonStyle: { ...block.buttonStyle, borderRadius } })
            }
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Font Size</Label>
            <span className="text-muted-foreground">
              {block.buttonStyle?.fontSize || 14}px
            </span>
          </div>
          <Slider
            value={[block.buttonStyle?.fontSize || 14]}
            min={12}
            max={20}
            step={1}
            onValueChange={([fontSize]) =>
              onUpdate({ buttonStyle: { ...block.buttonStyle, fontSize } })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Padding X</Label>
              <span className="text-muted-foreground text-xs">
                {block.buttonStyle?.paddingX || 16}px
              </span>
            </div>
            <Slider
              value={[block.buttonStyle?.paddingX || 16]}
              min={8}
              max={48}
              step={4}
              onValueChange={([paddingX]) =>
                onUpdate({ buttonStyle: { ...block.buttonStyle, paddingX } })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Padding Y</Label>
              <span className="text-muted-foreground text-xs">
                {block.buttonStyle?.paddingY || 8}px
              </span>
            </div>
            <Slider
              value={[block.buttonStyle?.paddingY || 8]}
              min={4}
              max={24}
              step={2}
              onValueChange={([paddingY]) =>
                onUpdate({ buttonStyle: { ...block.buttonStyle, paddingY } })
              }
            />
          </div>
        </div>
      </div>

      {/* Container Dimensions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Container</h4>

        <div className="space-y-2">
          <Label>Max Width</Label>
          <Input
            value={block.dimensions?.maxWidth || ''}
            onChange={(e) =>
              onUpdate({
                dimensions: { ...block.dimensions, maxWidth: e.target.value },
              })
            }
            placeholder="e.g., 400px, 100%"
          />
        </div>
      </div>
    </div>
  );
}

// ============== BENTO ITEM PROPERTIES ==============

interface BentoItemPropertiesProps {
  item: BentoGridItem;
  onUpdate: (updates: Partial<BentoGridItem>) => void;
}

function BentoItemProperties({ item, onUpdate }: BentoItemPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Bento Card</h3>
        <p className="text-sm text-muted-foreground">Edit card content and layout</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Content</h4>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={item.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={item.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Icon Name (Lucide)</Label>
          <Input
            value={item.icon || ''}
            onChange={(e) => onUpdate({ icon: e.target.value })}
            placeholder="e.g., Zap, Star, Heart"
          />
          <p className="text-xs text-muted-foreground">
            Use icon names from lucide.dev
          </p>
        </div>

        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={item.image || ''}
            onChange={(e) => onUpdate({ image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>
      </div>

      {/* Layout */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Size</h4>

        <div className="space-y-2">
          <Label>Column Span</Label>
          <Select
            value={String(item.colSpan || 1)}
            onValueChange={(value) => onUpdate({ colSpan: Number(value) as 1 | 2 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Column</SelectItem>
              <SelectItem value="2">2 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Row Span</Label>
          <Select
            value={String(item.rowSpan || 1)}
            onValueChange={(value) => onUpdate({ rowSpan: Number(value) as 1 | 2 })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Row</SelectItem>
              <SelectItem value="2">2 Rows</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

// ============== STEP PROPERTIES ==============

interface StepPropertiesProps {
  step: HowItWorksStep;
  onUpdate: (updates: Partial<HowItWorksStep>) => void;
}

function StepProperties({ step, onUpdate }: StepPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Step {step.number}</h3>
        <p className="text-sm text-muted-foreground">Edit step content</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Content</h4>

        <div className="space-y-2">
          <Label>Step Number</Label>
          <Input
            type="number"
            value={step.number}
            onChange={(e) => onUpdate({ number: Number(e.target.value) })}
            min={1}
          />
        </div>

        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={step.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={step.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label>Icon Name (Lucide)</Label>
          <Input
            value={step.icon || ''}
            onChange={(e) => onUpdate({ icon: e.target.value || undefined })}
            placeholder="e.g., Upload, Settings, Check"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to show step number
          </p>
        </div>
      </div>
    </div>
  );
}

// ============== FOOTER LINK PROPERTIES ==============

interface FooterLinkPropertiesProps {
  link: FooterLink;
  onUpdate: (updates: Partial<FooterLink>) => void;
}

function FooterLinkProperties({ link, onUpdate }: FooterLinkPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Footer Link</h3>
        <p className="text-sm text-muted-foreground">Edit link text and URL</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Link</h4>

        <div className="space-y-2">
          <Label>Text</Label>
          <Input
            value={link.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>URL</Label>
          <Input
            value={link.href}
            onChange={(e) => onUpdate({ href: e.target.value })}
            placeholder="https://example.com or /page"
          />
        </div>
      </div>
    </div>
  );
}

// ============== IMAGE BLOCK PROPERTIES ==============

interface ImageBlockPropertiesProps {
  block: ImageBlock;
  onUpdate: (updates: Partial<ImageBlock>) => void;
}

function ImageBlockProperties({ block, onUpdate }: ImageBlockPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Image Element</h3>
        <p className="text-sm text-muted-foreground">Edit image properties</p>
      </div>

      {/* Source */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Source</h4>

        <div className="space-y-2">
          <Label>Image URL</Label>
          <Input
            value={block.src}
            onChange={(e) => onUpdate({ src: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="space-y-2">
          <Label>Alt Text</Label>
          <Input
            value={block.alt}
            onChange={(e) => onUpdate({ alt: e.target.value })}
            placeholder="Image description"
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Dimensions</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Width (px)</Label>
            <Input
              type="number"
              value={block.width || ''}
              onChange={(e) =>
                onUpdate({ width: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="Auto"
            />
          </div>

          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={block.height || ''}
              onChange={(e) =>
                onUpdate({ height: e.target.value ? Number(e.target.value) : undefined })
              }
              placeholder="Auto"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Object Fit</Label>
          <Select
            value={block.objectFit || 'cover'}
            onValueChange={(value: 'cover' | 'contain' | 'fill' | 'none') =>
              onUpdate({ objectFit: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cover">Cover</SelectItem>
              <SelectItem value="contain">Contain</SelectItem>
              <SelectItem value="fill">Fill</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Styling */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Styling</h4>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Border Radius</Label>
            <span className="text-muted-foreground">{block.borderRadius || 0}px</span>
          </div>
          <Slider
            value={[block.borderRadius || 0]}
            min={0}
            max={50}
            step={2}
            onValueChange={([value]) => onUpdate({ borderRadius: value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Shadow</Label>
          <Select
            value={block.shadow || 'none'}
            onValueChange={(value: 'none' | 'sm' | 'md' | 'lg' | 'xl') =>
              onUpdate({ shadow: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin Top</Label>
              <span className="text-muted-foreground text-xs">
                {block.spacing?.marginTop || 0}px
              </span>
            </div>
            <Slider
              value={[block.spacing?.marginTop || 0]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) =>
                onUpdate({ spacing: { ...block.spacing, marginTop: value } })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin Bottom</Label>
              <span className="text-muted-foreground text-xs">
                {block.spacing?.marginBottom || 0}px
              </span>
            </div>
            <Slider
              value={[block.spacing?.marginBottom || 0]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) =>
                onUpdate({ spacing: { ...block.spacing, marginBottom: value } })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============== BUTTON BLOCK PROPERTIES ==============

interface ButtonBlockPropertiesProps {
  block: ButtonBlock;
  onUpdate: (updates: Partial<ButtonBlock>) => void;
}

function ButtonBlockProperties({ block, onUpdate }: ButtonBlockPropertiesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold">Button Element</h3>
        <p className="text-sm text-muted-foreground">Edit button properties</p>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Content</h4>

        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={block.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Link URL</Label>
          <Input
            value={block.href || ''}
            onChange={(e) => onUpdate({ href: e.target.value })}
            placeholder="https://example.com or /page"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="openNewTab"
            checked={block.openNewTab || false}
            onChange={(e) => onUpdate({ openNewTab: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="openNewTab">Open in new tab</Label>
        </div>
      </div>

      {/* Style */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Style</h4>

        <div className="space-y-2">
          <Label>Variant</Label>
          <Select
            value={block.variant}
            onValueChange={(value: ButtonVariant) => onUpdate({ variant: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="secondary">Secondary</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
              <SelectItem value="destructive">Destructive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Size</Label>
          <Select
            value={block.size}
            onValueChange={(value: ButtonSize) => onUpdate({ size: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
              <SelectItem value="xl">Extra Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Custom Colors */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Custom Colors</h4>

        <ColorPicker
          label="Background Color"
          value={block.backgroundColor || ''}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />

        <ColorPicker
          label="Text Color"
          value={block.textColor || ''}
          onChange={(textColor) => onUpdate({ textColor })}
        />

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <Label>Border Radius</Label>
            <span className="text-muted-foreground">{block.borderRadius || 6}px</span>
          </div>
          <Slider
            value={[block.borderRadius || 6]}
            min={0}
            max={50}
            step={2}
            onValueChange={([value]) => onUpdate({ borderRadius: value })}
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Dimensions</h4>

        <div className="space-y-2">
          <Label>Width</Label>
          <Input
            value={block.dimensions?.width || ''}
            onChange={(e) =>
              onUpdate({
                dimensions: { ...block.dimensions, width: e.target.value },
              })
            }
            placeholder="e.g., 200px, 100%, auto"
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin Top</Label>
              <span className="text-muted-foreground text-xs">
                {block.spacing?.marginTop || 0}px
              </span>
            </div>
            <Slider
              value={[block.spacing?.marginTop || 0]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) =>
                onUpdate({ spacing: { ...block.spacing, marginTop: value } })
              }
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <Label>Margin Bottom</Label>
              <span className="text-muted-foreground text-xs">
                {block.spacing?.marginBottom || 0}px
              </span>
            </div>
            <Slider
              value={[block.spacing?.marginBottom || 0]}
              min={0}
              max={100}
              step={4}
              onValueChange={([value]) =>
                onUpdate({ spacing: { ...block.spacing, marginBottom: value } })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
