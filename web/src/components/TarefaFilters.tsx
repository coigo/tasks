import { Search, Filter } from 'lucide-react';
import { FormSelect } from './FormSelect';
import type { Opcoes } from '../schemas/tarefa';
import type { FiltroTarefa } from '../pages/Tarefas';

interface TarefaFiltersProps {
  filtros: FiltroTarefa;
  onChange: (filtros: FiltroTarefa) => void;
  opcoes: Opcoes;
  hideProjeto?: boolean;
}

export function TarefaFilters({ filtros, onChange, opcoes, hideProjeto }: TarefaFiltersProps) {
  const update = <K extends keyof FiltroTarefa>(key: K, value: FiltroTarefa[K]) =>
    onChange({ ...filtros, [key]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <FormSelect
          label="Responsável"
          options={opcoes.usuarios.map((u) => ({ value: u.id, label: u.nome }))}
          value={filtros.responsavelId}
          onChange={(e) => update('responsavelId', e.target.value)}
        />
        <FormSelect
          label="Situação"
          options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
          value={filtros.situacaoId}
          onChange={(e) => update('situacaoId', e.target.value)}
        />
        <FormSelect
          label="Tipo"
          options={opcoes.tipos.map((t) => ({ value: t.id, label: t.descricao }))}
          value={filtros.tipoId}
          onChange={(e) => update('tipoId', e.target.value)}
        />
        {!hideProjeto && (
          <FormSelect
            label="Projeto"
            options={opcoes.projetos.map((p) => ({ value: p.id, label: p.nome }))}
            value={filtros.projetoId}
            onChange={(e) => update('projetoId', e.target.value)}
          />
        )}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">Busca</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar tarefa..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filtros.busca}
              onChange={(e) => update('busca', e.target.value)}
            />
          </div>
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <Filter size={16} />
        <input
          type="checkbox"
          checked={filtros.incluirEncerradas}
          onChange={(e) => update('incluirEncerradas', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        Incluir tarefas encerradas
      </label>
    </div>
  );
}
