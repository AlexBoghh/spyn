import { StateCreator } from 'zustand';
import type { Section, ContentBlock } from '../types';

export interface SectionSlice {
  sections: Section[];
  addSection: (section: Section) => void;
  removeSection: (id: string) => void;
  updateSection: (id: string, updates: Partial<Section>) => void;
  reorderSections: (ids: string[]) => void;
  addContentBlock: (sectionId: string, block: ContentBlock) => void;
  removeContentBlock: (sectionId: string, blockId: string) => void;
  updateContentBlock: (sectionId: string, blockId: string, updates: Partial<ContentBlock>) => void;
}

export const createSectionSlice: StateCreator<SectionSlice> = (set) => ({
  sections: [],

  addSection: (section) =>
    set((state) => ({ sections: [...state.sections, section] })),

  removeSection: (id) =>
    set((state) => ({ sections: state.sections.filter((s) => s.id !== id) })),

  updateSection: (id, updates) =>
    set((state) => ({
      sections: state.sections.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    })),

  reorderSections: (ids) =>
    set((state) => {
      const map = new Map(state.sections.map((s) => [s.id, s]));
      return { sections: ids.map((id) => map.get(id)!).filter(Boolean) };
    }),

  addContentBlock: (sectionId, block) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId ? { ...s, contentBlocks: [...s.contentBlocks, block] } : s
      ),
    })),

  removeContentBlock: (sectionId, blockId) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? { ...s, contentBlocks: s.contentBlocks.filter((b) => b.id !== blockId) }
          : s
      ),
    })),

  updateContentBlock: (sectionId, blockId, updates) =>
    set((state) => ({
      sections: state.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              contentBlocks: s.contentBlocks.map((b) =>
                b.id === blockId ? { ...b, ...updates } : b
              ),
            }
          : s
      ),
    })),
});
