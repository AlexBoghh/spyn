import { useCallback, useEffect, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useStore } from '../../store';
import { SectionCard } from './SectionCard';
import { PresetPicker } from './PresetPicker';
import type { Section } from '../../types';

export function SectionBuilder() {
  const sections = useStore((s) => s.sections);
  const addSection = useStore((s) => s.addSection);
  const removeSection = useStore((s) => s.removeSection);
  const updateSection = useStore((s) => s.updateSection);
  const reorderSections = useStore((s) => s.reorderSections);
  const removeContentBlock = useStore((s) => s.removeContentBlock);
  const selectedSectionId = useStore((s) => s.selectedSectionId);
  const selectSection = useStore((s) => s.selectSection);

  const panelRef = useRef<HTMLDivElement>(null);

  const handleAdd = useCallback(
    (section: Section) => addSection(section),
    [addSection],
  );

  const handleRemove = useCallback(
    (id: string) => {
      removeSection(id);
      if (selectedSectionId === id) selectSection(null);
    },
    [removeSection, selectedSectionId, selectSection],
  );

  const handleUpdateHeight = useCallback(
    (id: string, height: number) => updateSection(id, { height }),
    [updateSection],
  );

  const handleSelect = useCallback(
    (id: string) => selectSection(selectedSectionId === id ? null : id),
    [selectSection, selectedSectionId],
  );

  const handleRemoveBlock = useCallback(
    (sectionId: string, blockId: string) => removeContentBlock(sectionId, blockId),
    [removeContentBlock],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const ids = sections.map((s) => s.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      reorderSections(arrayMove(ids, oldIndex, newIndex));
    },
    [sections, reorderSections],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedSectionId) {
        handleRemove(selectedSectionId);
      }
    };
    const el = panelRef.current;
    el?.addEventListener('keydown', handleKeyDown);
    return () => el?.removeEventListener('keydown', handleKeyDown);
  }, [selectedSectionId, handleRemove]);

  const sectionIds = sections.map((s) => s.id);
  const totalHeight = sections.reduce((sum, s) => sum + s.height, 0);

  return (
    <div className="flex h-full flex-col" ref={panelRef} tabIndex={-1}>
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Sections
        </h2>
        {sections.length > 0 && (
          <span className="text-xs text-gray-500">{sections.length}</span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sections.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No sections yet. Add one below.
          </p>
        ) : (
          <>
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-1">
                  {sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      selected={section.id === selectedSectionId}
                      onSelect={handleSelect}
                      onRemove={handleRemove}
                      onUpdateHeight={handleUpdateHeight}
                      onRemoveBlock={handleRemoveBlock}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            <div className="text-xs text-gray-500 text-center mt-2 py-1">
              {totalHeight}vh total
            </div>
          </>
        )}
      </div>

      <div className="border-t border-gray-700">
        <PresetPicker onAdd={handleAdd} />
      </div>
    </div>
  );
}
