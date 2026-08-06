import { Link } from 'react-router-dom';
import { CORES_SITUACAO } from '../constants/coresSituacao';

export interface TarefaListItem {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoDescricao: string;
  situacaoCor: string;
  tipoDescricao: string;
  responsavelNome: string;
  projetoNome: string;
}

interface TarefaListProps {
  tarefas: TarefaListItem[];
  isLoading?: boolean;
}

export function TarefaList({ tarefas, isLoading }: TarefaListProps) {
  if (isLoading) {
    return <p className="text-gray-500 text-center py-8">Carregando...</p>;
  }

  if (tarefas.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada.</p>;
  }

  return (
    <div className="divide-y divide-gray-100">
      {tarefas.map((tarefa) => (
        <Link
          key={tarefa.id}
          to={`/tarefas/${tarefa.id}`}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 -mx-5 px-5 hover:bg-gray-50 transition-colors"
        >
          <div>
            <p className="font-medium text-gray-900">
              #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
            </p>
            <p className="text-sm text-gray-500">
              {tarefa.projetoNome} • {tarefa.tipoDescricao} • Responsável: {tarefa.responsavelNome}
            </p>
          </div>
          <span
            className="self-start px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${CORES_SITUACAO[tarefa.situacaoCor]?.bg || '#6B7280'}20`,
              color: CORES_SITUACAO[tarefa.situacaoCor]?.text || '#374151',
            }}
          >
            {tarefa.situacaoDescricao}
          </span>
        </Link>
      ))}
    </div>
  );
}
