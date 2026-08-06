import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CORES_SITUACAO } from '../constants/coresSituacao';
import { KanbanCard, type KanbanTarefa } from './KanbanCard';

export interface Situacao {
  id: number;
  descricao: string;
  cor: string;
  encerra_tarefa: boolean;
}

interface KanbanColumnProps {
  situacao: Situacao;
  tarefas: KanbanTarefa[];
}

export function KanbanColumn({ situacao, tarefas }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: situacao.id,
  });

  const bgColor = CORES_SITUACAO[situacao.cor]?.bg || '#6B7280';

  return (
    <div className="flex-shrink-0 w-72">
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
            <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {tarefas.length}
            </span>
          </div>
        </div>

        <div
          ref={setNodeRef}
          className={`p-2 space-y-2 min-h-[200px] transition-colors ${
            isOver ? 'bg-primary/5' : ''
          }`}
        >
          <SortableContext items={tarefas.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tarefas.map((tarefa) => (
              <KanbanCard key={tarefa.id} tarefa={tarefa} />
            ))}
          </SortableContext>

          {tarefas.length === 0 && (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              Arraste tarefas aqui
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
