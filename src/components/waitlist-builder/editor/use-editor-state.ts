'use client';

import { create } from 'zustand';
import type {
  WaitlistPageConfig,
  PageSection,
  SectionType,
  TextBlock,
  ImageBlock,
  ButtonBlock,
} from '@/lib/waitlist-builder/types';
import {
  createDefaultPageConfig,
  createSection,
  generateId,
} from '@/lib/waitlist-builder/defaults';

interface EditorStore {
  // State
  config: WaitlistPageConfig;
  originalConfig: WaitlistPageConfig | null;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  isDirty: boolean;
  isPreviewMode: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  isLoading: boolean;
  published: boolean;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;

  // History for undo/redo
  undoStack: WaitlistPageConfig[];
  redoStack: WaitlistPageConfig[];

  // Actions
  setConfig: (config: WaitlistPageConfig) => void;
  loadFromServer: () => Promise<void>;
  saveToServer: () => Promise<void>;
  publishPage: (publish: boolean) => Promise<void>;
  resetToDefaults: () => Promise<void>;

  // Section actions
  updateSection: <T extends PageSection>(
    sectionId: string,
    updates: Partial<T>
  ) => void;
  addSection: (type: SectionType, afterIndex?: number) => void;
  removeSection: (sectionId: string) => void;
  reorderSections: (startIndex: number, endIndex: number) => void;
  duplicateSection: (sectionId: string) => void;
  toggleSectionVisibility: (sectionId: string) => void;

  // Block actions (for custom insertable blocks)
  addBlock: (sectionId: string, blockType: 'text' | 'image' | 'button') => void;
  removeBlock: (sectionId: string, blockId: string) => void;
  updateBlock: (
    sectionId: string,
    blockId: string,
    updates: Partial<TextBlock | ImageBlock | ButtonBlock>
  ) => void;
  reorderBlocks: (sectionId: string, startIndex: number, endIndex: number) => void;

  // Selection
  selectSection: (sectionId: string | null) => void;
  selectBlock: (blockId: string | null) => void;

  // Preview
  togglePreviewMode: () => void;

  // Meta
  setMetaTitle: (title: string) => void;
  setMetaDescription: (description: string) => void;
  setOgImage: (image: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushToHistory: () => void;
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  config: createDefaultPageConfig(),
  originalConfig: null,
  selectedSectionId: null,
  selectedBlockId: null,
  isDirty: false,
  isPreviewMode: false,
  isSaving: false,
  isPublishing: false,
  isLoading: true,
  published: false,
  metaTitle: '',
  metaDescription: '',
  ogImage: '',
  undoStack: [],
  redoStack: [],

  // Set config
  setConfig: (config) => {
    set({ config, isDirty: true });
  },

  // Load from server
  loadFromServer: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/admin/waitlist-page');
      if (res.ok) {
        const data = await res.json();
        set({
          config: data.config,
          originalConfig: data.config,
          published: data.published,
          metaTitle: data.metaTitle || '',
          metaDescription: data.metaDescription || '',
          ogImage: data.ogImage || '',
          isDirty: false,
        });
      }
    } catch (error) {
      console.error('Failed to load page config:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Save to server
  saveToServer: async () => {
    const { config, metaTitle, metaDescription, ogImage } = get();
    set({ isSaving: true });
    try {
      const res = await fetch('/api/admin/waitlist-page', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, metaTitle, metaDescription, ogImage }),
      });
      if (res.ok) {
        set({ isDirty: false, originalConfig: config });
      }
    } catch (error) {
      console.error('Failed to save page config:', error);
      throw error;
    } finally {
      set({ isSaving: false });
    }
  },

  // Publish/unpublish
  publishPage: async (publish) => {
    set({ isPublishing: true });
    try {
      // Save first if dirty
      if (get().isDirty) {
        await get().saveToServer();
      }

      const res = await fetch('/api/admin/waitlist-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish }),
      });
      if (res.ok) {
        set({ published: publish });
      }
    } catch (error) {
      console.error('Failed to publish page:', error);
      throw error;
    } finally {
      set({ isPublishing: false });
    }
  },

  // Reset to defaults
  resetToDefaults: async () => {
    try {
      const res = await fetch('/api/admin/waitlist-page', {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        set({
          config: data.config,
          originalConfig: data.config,
          isDirty: false,
          published: false,
        });
      }
    } catch (error) {
      console.error('Failed to reset page:', error);
      throw error;
    }
  },

  // Update section
  updateSection: (sectionId, updates) => {
    get().pushToHistory();
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((section) =>
          section.id === sectionId ? { ...section, ...updates } : section
        ),
      },
      isDirty: true,
    }));
  },

  // Add section
  addSection: (type, afterIndex) => {
    get().pushToHistory();
    set((state) => {
      const newSection = createSection(
        type,
        afterIndex !== undefined ? afterIndex + 1 : state.config.sections.length
      );
      const sections = [...state.config.sections];

      if (afterIndex !== undefined) {
        sections.splice(afterIndex + 1, 0, newSection);
      } else {
        sections.push(newSection);
      }

      // Update order values
      sections.forEach((s, i) => (s.order = i));

      return {
        config: { ...state.config, sections },
        selectedSectionId: newSection.id,
        isDirty: true,
      };
    });
  },

  // Remove section
  removeSection: (sectionId) => {
    get().pushToHistory();
    set((state) => {
      const sections = state.config.sections.filter((s) => s.id !== sectionId);
      sections.forEach((s, i) => (s.order = i));

      return {
        config: { ...state.config, sections },
        selectedSectionId:
          state.selectedSectionId === sectionId
            ? null
            : state.selectedSectionId,
        isDirty: true,
      };
    });
  },

  // Reorder sections
  reorderSections: (startIndex, endIndex) => {
    get().pushToHistory();
    set((state) => {
      const sections = [...state.config.sections];
      const [removed] = sections.splice(startIndex, 1);
      sections.splice(endIndex, 0, removed);
      sections.forEach((s, i) => (s.order = i));

      return {
        config: { ...state.config, sections },
        isDirty: true,
      };
    });
  },

  // Duplicate section
  duplicateSection: (sectionId) => {
    get().pushToHistory();
    set((state) => {
      const sectionIndex = state.config.sections.findIndex(
        (s) => s.id === sectionId
      );
      if (sectionIndex === -1) return state;

      const originalSection = state.config.sections[sectionIndex];
      const duplicatedSection = JSON.parse(
        JSON.stringify(originalSection)
      ) as PageSection;

      // Generate new IDs
      duplicatedSection.id = generateId();
      duplicatedSection.order = sectionIndex + 1;

      const sections = [...state.config.sections];
      sections.splice(sectionIndex + 1, 0, duplicatedSection);
      sections.forEach((s, i) => (s.order = i));

      return {
        config: { ...state.config, sections },
        selectedSectionId: duplicatedSection.id,
        isDirty: true,
      };
    });
  },

  // Toggle section visibility
  toggleSectionVisibility: (sectionId) => {
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((section) =>
          section.id === sectionId
            ? { ...section, visible: !section.visible }
            : section
        ),
      },
      isDirty: true,
    }));
  },

  // Add block to section
  addBlock: (sectionId, blockType) => {
    get().pushToHistory();
    const newBlockId = generateId();

    let newBlock: TextBlock | ImageBlock | ButtonBlock;

    if (blockType === 'text') {
      newBlock = {
        id: newBlockId,
        type: 'text',
        content: 'New text block',
        variant: 'p',
        alignment: 'center',
      } as TextBlock;
    } else if (blockType === 'image') {
      newBlock = {
        id: newBlockId,
        type: 'image',
        src: 'https://placehold.co/400x300',
        alt: 'Image',
        objectFit: 'cover',
        borderRadius: 8,
      } as ImageBlock;
    } else {
      newBlock = {
        id: newBlockId,
        type: 'button',
        text: 'Click me',
        variant: 'default',
        size: 'default',
        action: 'link',
        href: '#',
      } as ButtonBlock;
    }

    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customBlocks: [...(section.customBlocks || []), newBlock],
              }
            : section
        ),
      },
      selectedBlockId: newBlockId,
      isDirty: true,
    }));
  },

  // Remove block from section
  removeBlock: (sectionId, blockId) => {
    get().pushToHistory();
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                customBlocks: (section.customBlocks || []).filter(
                  (b) => b.id !== blockId
                ),
              }
            : section
        ),
      },
      selectedBlockId:
        state.selectedBlockId === blockId ? null : state.selectedBlockId,
      isDirty: true,
    }));
  },

  // Update block in section
  updateBlock: (sectionId, blockId, updates) => {
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const updatedBlocks = (section.customBlocks || []).map((block) =>
            block.id === blockId ? { ...block, ...updates } : block
          ) as Array<TextBlock | ImageBlock | ButtonBlock>;
          return { ...section, customBlocks: updatedBlocks };
        }) as PageSection[],
      },
      isDirty: true,
    }));
  },

  // Reorder blocks within section
  reorderBlocks: (sectionId, startIndex, endIndex) => {
    get().pushToHistory();
    set((state) => ({
      config: {
        ...state.config,
        sections: state.config.sections.map((section) => {
          if (section.id !== sectionId) return section;
          const blocks = [...(section.customBlocks || [])];
          const [removed] = blocks.splice(startIndex, 1);
          blocks.splice(endIndex, 0, removed);
          return { ...section, customBlocks: blocks };
        }),
      },
      isDirty: true,
    }));
  },

  // Selection
  selectSection: (sectionId) => {
    set({ selectedSectionId: sectionId, selectedBlockId: null });
  },

  selectBlock: (blockId) => {
    if (blockId === null) {
      set({ selectedBlockId: null });
      return;
    }
    // Find the section containing this block
    const { config } = get();
    let containingSectionId: string | null = null;

    // Helper to check if an object has the matching block id
    const hasBlockId = (obj: unknown): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      if ('id' in obj && (obj as { id: string }).id === blockId) return true;
      return false;
    };

    // Helper to recursively search for block in object
    const searchInObject = (obj: unknown): boolean => {
      if (!obj || typeof obj !== 'object') return false;
      if (hasBlockId(obj)) return true;
      if (Array.isArray(obj)) {
        return obj.some(item => searchInObject(item));
      }
      for (const value of Object.values(obj as Record<string, unknown>)) {
        if (searchInObject(value)) return true;
      }
      return false;
    };

    for (const section of config.sections) {
      // Check if block exists in section's customBlocks
      if (section.customBlocks?.some((b) => b.id === blockId)) {
        containingSectionId = section.id;
        break;
      }
      // Search in section.content for nested blocks (headline, subheadline, cta, items, steps, etc.)
      if (searchInObject((section as { content?: unknown }).content)) {
        containingSectionId = section.id;
        break;
      }
    }

    set({
      selectedBlockId: blockId,
      selectedSectionId: containingSectionId ?? get().selectedSectionId
    });
  },

  // Preview mode
  togglePreviewMode: () => {
    set((state) => ({
      isPreviewMode: !state.isPreviewMode,
      selectedSectionId: null,
      selectedBlockId: null,
    }));
  },

  // Meta
  setMetaTitle: (metaTitle) => set({ metaTitle, isDirty: true }),
  setMetaDescription: (metaDescription) =>
    set({ metaDescription, isDirty: true }),
  setOgImage: (ogImage) => set({ ogImage, isDirty: true }),

  // History
  pushToHistory: () => {
    set((state) => ({
      undoStack: [...state.undoStack.slice(-19), state.config],
      redoStack: [],
    }));
  },

  undo: () => {
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const previous = state.undoStack[state.undoStack.length - 1];
      return {
        config: previous,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state.config],
        isDirty: true,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        config: next,
        undoStack: [...state.undoStack, state.config],
        redoStack: state.redoStack.slice(0, -1),
        isDirty: true,
      };
    });
  },
}));
