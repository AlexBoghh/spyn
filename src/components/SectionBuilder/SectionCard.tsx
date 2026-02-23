import { useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronRight } from 'lucide-react';
import { NumericInput } from '../ui';
import { ContentBlockItem } from './ContentBlockItem';
import type { Section } from '../../types';

interface SectionCardProps {
  section: Section;
  selected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onUpdateHeight: (id: string, height: number) => void;
  onRemoveBlock: (sectionId: string, blockId: string) => void;
}

export function SectionCard({
  section,
  selected,
  onSelect,
  onRemove,
  onUpdateHeight,
  onRemoveBlock,
}: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSelect = useCallback(() => onSelect(section.id), [onSelect, section.id]);
  const handleRemove = useCallback(() => onRemove(section.id), [onRemove, section.id]);
  const handleHeight = useCallback(
    (v: number) => onUpdateHeight(section.id, v),
    [onUpdateHeight, section.id],
  );
  const toggleExpand = useCallback(() => setExpanded((prev) => !prev), []);

  const borderColor = selected ? 'border-indigo-500' : 'border-gray-700';
  const hasBlocks = section.contentBlocks.length > 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded bg-gray-800 border ${borderColor} p-2`}
    >
      <div className="flex items-center gap-2" onClick={handleSelect} role="button" tabIndex={-1}>
        <div
          className="w-1 self-stretch rounded-full shrink-0"
          style={{ backgroundColor: section.color }}
        />
        <button
          type="button"
          className="cursor-grab touch-none text-gray-500 hover:text-gray-300"
          aria-label="Drag to reorder"
          onClick={(e) => e.stopPropagation()}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={14} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-200 truncate">{section.label}</span>
            {hasBlocks && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleExpand(); }}
                className="flex items-center gap-0.5 text-xs text-gray-500 hover:text-gray-300"
                aria-label={expanded ? 'Collapse blocks' : 'Expand blocks'}
              >
                <ChevronRight
                  size={10}
                  className={`transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
                />
                {section.contentBlocks.length}
              </button>
            )}
            {!hasBlocks && (
              <span className="text-xs text-gray-500">0 blocks</span>
            )}
          </div>
        </div>
        <div className="w-20 shrink-0" onClick={(e) => e.stopPropagation()}>
          <NumericInput
            label=""
            value={section.height}
            onChange={handleHeight}
            min={50}
            max={500}
            step={10}
            suffix="vh"
          />
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleRemove(); }}
          className="text-gray-500 hover:text-red-400 shrink-0"
          aria-label={`Remove ${section.label}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
      {expanded && hasBlocks && (
        <div className="ml-6 mt-1 border-l border-gray-700 pl-2">
          {section.contentBlocks.map((block) => (
            <ContentBlockItem
              key={block.id}
              block={block}
              onRemove={() => onRemoveBlock(section.id, block.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
