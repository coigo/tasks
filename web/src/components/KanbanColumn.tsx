import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CORES_SITUACAO } from '../constants/coresSituacao';
import { KanbanCard } from './KanbanCard';
import type { TarefaResumida } from '../schemas/tarefa';

export interface Situacao {
  id: number;
  descricao: string;
  cor?: string;
  encerra_tarefa?: boolean;
}

interface KanbanColumnProps {
  situacao: Situacao;
  tarefas: TarefaResumida[];
}

export function KanbanColumn({ situacao, tarefas }: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({ id: `column-${situacao.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const bgColor = CORES_SITUACAO[situacao.cor || 'gray']?.bg || '#6B7280';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex-shrink-0 w-72 ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
        <div
          className="px-3 py-2 border-b border-gray-200"
          style={{ borderTopColor: bgColor, borderTopWidth: 3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: bgColor }}
              />
              <h3 className="font-medium text-gray-900 text-sm">{situacao.descricao}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </button>
              <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
                {tarefas.length}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`p-2 space-y-2 min-h-[200px] transition-colors ${
            isOver ? 'bg-primary/10 border-2 border-dashed border-blue-300' : ''
          }`}
        >
          <SortableContext items={tarefas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tarefas.map((tarefa) => (
              <KanbanCard key={tarefa.id} tarefa={tarefa} />
            ))}
          </SortableContext>

          {tarefas.length === 0 && (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Arraste aqui
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
