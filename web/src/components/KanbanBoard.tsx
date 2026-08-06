import { useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import api from '../services/api';
import toast from 'react-hot-toast';
import { KanbanColumn } from './KanbanColumn';
import type { KanbanTarefa } from './KanbanCard';

interface KanbanBoardProps {
  tarefas: KanbanTarefa[];
  situacoes: { id: number; descricao: string; cor: string; encerra_tarefa: boolean }[];
  onTarefaMoved?: () => void;
}

export function KanbanBoard({ tarefas, situacoes, onTarefaMoved }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 20,
      },
    })
  );

  const groupedTarefas = situacoes.reduce((acc, situacao) => {
    acc[situacao.id] = tarefas.filter((t) => t.situacaoId === situacao.id);
    return acc;
  }, {} as Record<number, KanbanTarefa[]>);

  const activeTarefa = activeId ? tarefas.find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const tarefaId = active.id as number;
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa) return;

    let novaSituacaoId: number | null = null;
    const overId = String(over.id);

    if (overId.startsWith('column-')) {
      novaSituacaoId = parseInt(overId.replace('column-', ''), 10);
    } else {
      const tarefaSobre = tarefas.find((t) => t.id === over.id);
      if (tarefaSobre) {
        novaSituacaoId = tarefaSobre.situacaoId;
      }
    }

    if (!novaSituacaoId || tarefa.situacaoId === novaSituacaoId) return;

    try {
      await api.put(`/tarefas/${tarefaId}/mover`, {
        situacao_id: novaSituacaoId,
      });
      toast.success('Tarefa movida');
      onTarefaMoved?.();
    } catch {
      toast.error('Erro ao mover tarefa');
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {situacoes.map((situacao) => (
          <KanbanColumn
            key={situacao.id}
            situacao={situacao}
            tarefas={groupedTarefas[situacao.id] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTarefa ? (
          <div className="bg-white border-2 border-primary rounded-lg p-3 shadow-xl cursor-grabbing">
            <p className="font-medium text-gray-900 text-sm">
              #{activeTarefa.numero}/{activeTarefa.ano} {activeTarefa.titulo}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
