import { useState, useCallback, type ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface PropertyGroupProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function PropertyGroup({
  label,
  defaultOpen = true,
  children,
}: PropertyGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  const toggle = useCallback(() => setOpen((prev) => !prev), []);

  return (
    <div className="border-b border-gray-700">
      <button
        type="button"
        onClick={toggle}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 hover:bg-gray-700/50"
      >
        <ChevronRight
          size={14}
          className={`transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
        />
        {label}
      </button>
      {open && <div className="pl-2 pb-2 px-3">{children}</div>}
    </div>
  );
}
