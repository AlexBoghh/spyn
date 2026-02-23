import { useCallback, type KeyboardEvent, type ChangeEvent } from 'react';

interface NumericInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  className?: string;
}

function clampValue(val: number, min?: number, max?: number): number {
  let v = val;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
}

export function NumericInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  className = '',
}: NumericInputProps) {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const parsed = parseFloat(e.target.value);
      if (!Number.isNaN(parsed)) {
        onChange(clampValue(parsed, min, max));
      }
    },
    [onChange, min, max],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      const multiplier = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onChange(clampValue(value + step * multiplier, min, max));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onChange(clampValue(value - step * multiplier, min, max));
      }
    },
    [onChange, value, step, min, max],
  );

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-xs text-gray-400">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          className="h-7 bg-gray-900 border border-gray-600 rounded px-2 text-sm font-mono text-gray-100 w-full focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
