import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CORES_SITUACAO } from '../constants/coresSituacao';

export interface KanbanTarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoId: number;
  situacaoDescricao: string;
  situacaoCor: string;
  tipoDescricao: string;
  responsavelNome: string;
  projetoNome: string;
}

interface KanbanCardProps {
  tarefa: KanbanTarefa;
}

export function KanbanCard({ tarefa }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tarefa.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <Link to={`/tarefas/${tarefa.id}`} className="block">
        <p className="font-medium text-gray-900 text-sm mb-1">
          #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
        </p>
        <p className="text-xs text-gray-500 mb-2">
          {tarefa.projetoNome} • {tarefa.tipoDescricao}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{tarefa.responsavelNome}</span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${CORES_SITUACAO[tarefa.situacaoCor]?.bg || '#6B7280'}20`,
              color: CORES_SITUACAO[tarefa.situacaoCor]?.text || '#374151',
            }}
          >
            {tarefa.situacaoDescricao}
          </span>
        </div>
      </Link>
    </div>
  );
}
