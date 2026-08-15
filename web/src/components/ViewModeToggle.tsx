import { LayoutList, LayoutGrid } from 'lucide-react';

interface ViewModeToggleProps {
  mode: 'list' | 'kanban';
  onChange: (mode: 'list' | 'kanban') => void;
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  return (
    <div className="flex border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors ${
          mode === 'list'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutList size={16} />
        Lista
      </button>
      <button
        onClick={() => onChange('kanban')}
        className={`px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors ${
          mode === 'kanban'
            ? 'bg-primary text-white'
            : 'bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        <LayoutGrid size={16} />
        Kanban
      </button>
    </div>
  );
}
