import { useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { NumericInput } from '../ui';
import type { Section } from '../../types';

interface SectionCardProps {
  section: Section;
  onRemove: (id: string) => void;
  onUpdateHeight: (id: string, height: number) => void;
}

export function SectionCard({ section, onRemove, onUpdateHeight }: SectionCardProps) {
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

  const handleRemove = useCallback(() => onRemove(section.id), [onRemove, section.id]);
  const handleHeight = useCallback(
    (v: number) => onUpdateHeight(section.id, v),
    [onUpdateHeight, section.id],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded bg-gray-800 border border-gray-700 p-2"
    >
      <div
        className="w-1 self-stretch rounded-full shrink-0"
        style={{ backgroundColor: section.color }}
      />
      <button
        type="button"
        className="cursor-grab touch-none text-gray-500 hover:text-gray-300"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-200 truncate">{section.label}</span>
          <span className="text-xs text-gray-500">{section.contentBlocks.length} blocks</span>
        </div>
      </div>
      <div className="w-20 shrink-0">
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
        onClick={handleRemove}
        className="text-gray-500 hover:text-red-400 shrink-0"
        aria-label={`Remove ${section.label}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
