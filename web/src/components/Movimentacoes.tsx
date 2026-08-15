import { useState } from 'react';
import { FormSelect } from './FormSelect';
import { Button } from './Button';
import { Plus, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../services/api';
import { useMutate } from '../hooks/useApi';
import type { Movimentacao } from '../schemas/tarefa';
import type { Opcoes } from '../schemas/tarefa';

interface MovimentacoesProps {
  tarefaId: number;
  movimentacoes: Movimentacao[];
  opcoes: Opcoes;
  onChange: (movimentacoes: Movimentacao[]) => void;
  onSituacaoChange?: (situacaoId: string) => void;
}

export function Movimentacoes({ tarefaId, movimentacoes, opcoes, onChange, onSituacaoChange }: MovimentacoesProps) {
  const [novaMovimentacao, setNovaMovimentacao] = useState({ situacaoId: '', descricao: '' });
  const [editandoMovimentacao, setEditandoMovimentacao] = useState<Movimentacao | null>(null);

  const { execute: criarMovimentacao } = useMutate('/tarefas', 'post');
  const { execute: atualizarMovimentacao } = useMutate('/tarefas', 'put');
  const { execute: removerMovimentacao } = useMutate('/tarefas', 'delete');

  const recarregar = async () => {
    const response = await api.get(`/tarefas/${tarefaId}/movimentacoes`);
    onChange(response.data);
  };

  const handleAdicionar = async () => {
    if (!novaMovimentacao.descricao && !novaMovimentacao.situacaoId) {
      toast.error('Informe uma situação ou uma descrição');
      return;
    }
    try {
      const payload: { situacaoId?: number; descricao: string } = {
        descricao: novaMovimentacao.descricao,
      };
      if (novaMovimentacao.situacaoId) {
        payload.situacaoId = Number(novaMovimentacao.situacaoId);
      }
      await criarMovimentacao(payload, `/tarefas/${tarefaId}/movimentacoes`);
      setNovaMovimentacao({ situacaoId: '', descricao: '' });
      await recarregar();
      if (novaMovimentacao.situacaoId) {
        onSituacaoChange?.(novaMovimentacao.situacaoId);
      }
      toast.success('Movimentação registrada');
    } catch {
      toast.error('Erro ao registrar movimentação');
    }
  };

  const handleAtualizar = async () => {
    if (!editandoMovimentacao) return;
    try {
      await atualizarMovimentacao(
        { descricao: editandoMovimentacao.descricao },
        `/tarefas/${tarefaId}/movimentacoes/${editandoMovimentacao.id}`
      );
      setEditandoMovimentacao(null);
      await recarregar();
      toast.success('Movimentação atualizada');
    } catch {
      toast.error('Erro ao atualizar movimentação');
    }
  };

  const handleRemover = async (movimentacaoId: number) => {
    if (!confirm('Deseja remover esta movimentação?')) return;
    try {
      await removerMovimentacao(undefined, `/tarefas/${tarefaId}/movimentacoes/${movimentacaoId}`);
      onChange(movimentacoes.filter((m) => m.id !== movimentacaoId));
      toast.success('Movimentação removida');
    } catch {
      toast.error('Erro ao remover movimentação');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <FormSelect
          label="Alterar situação (opcional)"
          options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
          value={novaMovimentacao.situacaoId}
          onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, situacaoId: e.target.value })}
        />
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Detalhes</label>
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              placeholder="Descreva a movimentação (suporta HTML)"
              value={novaMovimentacao.descricao}
              onChange={(e) => setNovaMovimentacao({ ...novaMovimentacao, descricao: e.target.value })}
            />
            <Button onClick={handleAdicionar}>
              <Plus size={18} />
              Registrar
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {movimentacoes.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada.</p>
        ) : (
          movimentacoes.map((movimentacao) => (
            <div key={movimentacao.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  <span className="font-medium text-gray-900">{movimentacao.situacaoDescricao}</span>
                  <span className="text-sm text-gray-500">por {movimentacao.criadoPorNome}</span>
                </div>
                <span className="text-sm text-gray-400">
                  {format(new Date(movimentacao.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </span>
              </div>

              {editandoMovimentacao?.id === movimentacao.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={editandoMovimentacao.descricao}
                    onChange={(e) =>
                      setEditandoMovimentacao({ ...editandoMovimentacao, descricao: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAtualizar}>Salvar</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditandoMovimentacao(null)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div
                    className="text-sm text-gray-700 prose"
                    dangerouslySetInnerHTML={{ __html: movimentacao.descricao || 'Sem detalhes' }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditandoMovimentacao(movimentacao)}>
                      <Pencil size={16} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => handleRemover(movimentacao.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
