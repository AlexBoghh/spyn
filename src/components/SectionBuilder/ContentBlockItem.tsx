import {
  Heading,
  Type,
  MousePointerClick,
  LayoutGrid,
  Image,
  FileText,
  Puzzle,
  X,
} from 'lucide-react';
import type { ContentBlock } from '../../types';

interface ContentBlockItemProps {
  block: ContentBlock;
  onRemove: () => void;
}

const BLOCK_ICONS: Record<ContentBlock['type'], typeof Heading> = {
  heading: Heading,
  subtitle: Type,
  'text-block': FileText,
  button: MousePointerClick,
  card: LayoutGrid,
  image: Image,
  form: FileText,
  custom: Puzzle,
};

export function ContentBlockItem({ block, onRemove }: ContentBlockItemProps) {
  const Icon = BLOCK_ICONS[block.type] ?? Puzzle;

  return (
    <div className="flex items-center gap-2 py-1 px-1 rounded hover:bg-gray-700/50 group">
      <Icon size={12} className="text-gray-500 shrink-0" />
      <span className="text-xs text-gray-300 truncate flex-1">{block.label}</span>
      <span className="text-xs text-gray-500 font-mono shrink-0">
        {block.position.x},{block.position.y}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 shrink-0"
        aria-label={`Remove ${block.label}`}
      >
        <X size={12} />
      </button>
    </div>
  );
}
