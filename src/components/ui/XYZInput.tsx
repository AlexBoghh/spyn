import { useCallback } from 'react';
import { NumericInput } from './NumericInput';

interface XYZInputProps {
  label: string;
  value: { x: number; y: number; z: number };
  onChange: (value: { x: number; y: number; z: number }) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

const AXES = [
  { key: 'x' as const, color: 'border-l-2 border-red-500' },
  { key: 'y' as const, color: 'border-l-2 border-green-500' },
  { key: 'z' as const, color: 'border-l-2 border-blue-500' },
];

export function XYZInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
}: XYZInputProps) {
  const handleAxis = useCallback(
    (axis: 'x' | 'y' | 'z', v: number) => {
      onChange({ ...value, [axis]: v });
    },
    [onChange, value],
  );

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="grid grid-cols-3 gap-1">
        {AXES.map(({ key, color }) => (
          <div key={key} className={`${color} pl-1`}>
            <NumericInput
              label={key.toUpperCase()}
              value={value[key]}
              onChange={(v) => handleAxis(key, v)}
              min={min}
              max={max}
              step={step}
              suffix={suffix}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
