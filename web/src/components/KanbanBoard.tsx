import { useState, useMemo } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import api from '../services/api';
import toast from 'react-hot-toast';
import { KanbanColumn } from './KanbanColumn';
import { useAppSettings } from '../hooks/useLocalStorage';
import type { TarefaResumida } from '../schemas/tarefa';

interface KanbanBoardProps {
  tarefas: TarefaResumida[];
  situacoes: { id: number; descricao: string; cor?: string; encerra_tarefa?: boolean }[];
  onTarefaMoved?: () => void;
}

export function KanbanBoard({ tarefas, situacoes, onTarefaMoved }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [settings, setSettings] = useAppSettings();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 20,
      },
    })
  );

  const orderedSituacoes = useMemo(() => {
    const savedOrder = settings.kanbanSituacoesOrder || [];
    if (savedOrder.length === 0) return situacoes;

    const situacaoMap = new Map(situacoes.map(s => [s.id, s]));
    const ordered: typeof situacoes = [];

    for (const id of savedOrder) {
      const situacao = situacaoMap.get(id);
      if (situacao) {
        ordered.push(situacao);
        situacaoMap.delete(id);
      }
    }

    for (const [, situacao] of situacaoMap) {
      ordered.push(situacao);
    }

    return ordered;
  }, [situacoes, settings.kanbanSituacoesOrder]);

  const columnIds = useMemo(() => orderedSituacoes.map(s => `column-${s.id}`), [orderedSituacoes]);

  const groupedTarefas = useMemo(() => {
    return situacoes.reduce((acc, situacao) => {
      acc[situacao.id] = tarefas.filter((t) => t.situacaoId === situacao.id);
      return acc;
    }, {} as Record<number, TarefaResumida[]>);
  }, [tarefas, situacoes]);

  const activeTarefa = activeId ? tarefas.find((t) => t.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    if (!id.startsWith('column-')) {
      setActiveId(event.active.id as number);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr.startsWith('column-') && overIdStr.startsWith('column-')) {
      const activeSituacaoId = parseInt(activeIdStr.replace('column-', ''), 10);
      const overSituacaoId = parseInt(overIdStr.replace('column-', ''), 10);

      if (activeSituacaoId === overSituacaoId) return;

      const currentOrder = settings.kanbanSituacoesOrder || orderedSituacoes.map(s => s.id);
      const activeIndex = currentOrder.indexOf(activeSituacaoId);
      const overIndex = currentOrder.indexOf(overSituacaoId);

      if (activeIndex === -1 || overIndex === -1) return;

      const newOrder = [...currentOrder];
      newOrder.splice(activeIndex, 1);
      newOrder.splice(overIndex, 0, activeSituacaoId);

      setSettings(prev => ({
        ...prev,
        kanbanSituacoesOrder: newOrder,
      }));

      return;
    }

    const tarefaId = active.id as number;
    const tarefa = tarefas.find((t) => t.id === tarefaId);
    if (!tarefa) return;

    let novaSituacaoId: number | null = null;

    if (overIdStr.startsWith('column-')) {
      novaSituacaoId = parseInt(overIdStr.replace('column-', ''), 10);
    } else {
      const tarefaSobre = tarefas.find((t) => t.id === over.id);
      if (tarefaSobre) {
        novaSituacaoId = tarefaSobre.situacaoId;
      }
    }

    if (!novaSituacaoId || tarefa.situacaoId === novaSituacaoId) return;

    try {
      await api.put(`/tarefas/${tarefaId}/mover`, {
        situacaoId: novaSituacaoId,
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
      <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {orderedSituacoes.map((situacao) => (
            <KanbanColumn
              key={situacao.id}
              situacao={situacao}
              tarefas={groupedTarefas[situacao.id] || []}
            />
          ))}
        </div>
      </SortableContext>

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
