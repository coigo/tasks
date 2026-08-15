import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CORES_SITUACAO } from '../constants/coresSituacao';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, ChevronDown, ChevronRight } from 'lucide-react';

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
  prazo: string | null;
  tarefaPaiId: number | null;
}

interface TarefaListProps {
  tarefas: TarefaListItem[];
  isLoading?: boolean;
}

interface Row {
  tarefa: TarefaListItem;
  depth: number;
}

function buildTree(tarefas: TarefaListItem[]) {
  const childrenMap = new Map<number, TarefaListItem[]>();
  const roots: TarefaListItem[] = [];

  for (const tarefa of tarefas) {
    if (tarefa.tarefaPaiId) {
      const irmaos = childrenMap.get(tarefa.tarefaPaiId) || [];
      irmaos.push(tarefa);
      childrenMap.set(tarefa.tarefaPaiId, irmaos);
    } else {
      roots.push(tarefa);
    }
  }

  return { roots, childrenMap };
}

function getVisibleRows(
  roots: TarefaListItem[],
  childrenMap: Map<number, TarefaListItem[]>,
  expandedIds: Set<number>
): Row[] {
  const rows: Row[] = [];

  function walk(tarefas: TarefaListItem[], depth: number) {
    for (const tarefa of tarefas) {
      rows.push({ tarefa, depth });
      if (expandedIds.has(tarefa.id)) {
        walk(childrenMap.get(tarefa.id) || [], depth + 1);
      }
    }
  }

  walk(roots, 0);
  return rows;
}

export function TarefaList({ tarefas, isLoading }: TarefaListProps) {
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  if (isLoading) {
    return <p className="text-gray-500 text-center py-8">Carregando...</p>;
  }

  if (tarefas.length === 0) {
    return <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada.</p>;
  }

  const { roots, childrenMap } = buildTree(tarefas);
  const hasChildrenIds = new Set<number>(
    tarefas.filter((t) => tarefas.some((filha) => filha.tarefaPaiId === t.id)).map((t) => t.id)
  );
  const rows = getVisibleRows(roots, childrenMap, expandedIds);

  const toggleExpand = (id: number) => {
    if (!hasChildrenIds.has(id)) return;
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  return (
    <div className="divide-y divide-gray-100">
      {rows.map(({ tarefa, depth }) => {
        const hasChildren = hasChildrenIds.has(tarefa.id);
        const isExpanded = expandedIds.has(tarefa.id);

        return (
          <div
            key={tarefa.id}
            className="flex items-center gap-2 py-4 -mx-5 px-5 hover:bg-gray-50 transition-colors"
            style={{ paddingLeft: `${depth * 24 + 20}px` }}
          >
            <button
              type="button"
              onClick={() => toggleExpand(tarefa.id)}
              className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 text-gray-500 ${
                hasChildren ? 'cursor-pointer' : 'invisible'
              }`}
              aria-label={isExpanded ? 'Recolher subtarefas' : 'Expandir subtarefas'}
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            <Link
              to={`/tarefas/${tarefa.id}`}
              className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {tarefa.projetoNome} • {tarefa.tipoDescricao} • Responsável: {tarefa.responsavelNome}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {tarefa.prazo && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar size={14} />
                    {format(new Date(tarefa.prazo), 'dd/MM/yyyy', { locale: ptBR })}
                  </span>
                )}
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
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
      })}
    </div>
  );
}
