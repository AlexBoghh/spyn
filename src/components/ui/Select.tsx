import { useCallback, type ChangeEvent } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export function Select({
  label,
  value,
  onChange,
  options,
  className = '',
}: SelectProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const groups = new Map<string, SelectOption[]>();
  const ungrouped: SelectOption[] = [];

  for (const opt of options) {
    if (opt.group) {
      const list = groups.get(opt.group) ?? [];
      list.push(opt);
      groups.set(opt.group, list);
    } else {
      ungrouped.push(opt);
    }
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-gray-400">{label}</label>
      <select
        value={value}
        onChange={handleChange}
        className="h-7 bg-gray-900 border border-gray-600 rounded px-2 text-sm text-gray-100 w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none"
      >
        {ungrouped.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
        {[...groups.entries()].map(([groupName, groupOpts]) => (
          <optgroup key={groupName} label={groupName}>
            {groupOpts.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}
