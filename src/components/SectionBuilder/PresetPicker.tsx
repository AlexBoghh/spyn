import { useCallback } from 'react';
import { createSection, SECTION_COLORS, SECTION_LABELS } from '../../utils/presets';
import type { Section, SectionPresetType } from '../../types';

interface PresetPickerProps {
  onAdd: (section: Section) => void;
}

const PRESET_TYPES = Object.keys(SECTION_LABELS) as SectionPresetType[];

export function PresetPicker({ onAdd }: PresetPickerProps) {
  const handleClick = useCallback(
    (type: SectionPresetType) => {
      onAdd(createSection(type));
    },
    [onAdd],
  );

  return (
    <div className="grid grid-cols-2 gap-1 p-3">
      {PRESET_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          onClick={() => handleClick(type)}
          className="flex items-center gap-2 text-xs text-gray-400 hover:bg-gray-700 rounded px-2 py-1.5 text-left"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: SECTION_COLORS[type] }}
          />
          {SECTION_LABELS[type]}
        </button>
      ))}
    </div>
  );
}
