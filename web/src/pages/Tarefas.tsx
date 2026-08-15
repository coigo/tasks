import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus } from 'lucide-react';
import { TarefaList } from '../components/TarefaList';
import { KanbanBoard } from '../components/KanbanBoard';
import { TarefaFilters } from '../components/TarefaFilters';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { useAppSettings } from '../hooks/useLocalStorage';
import { useTarefaOpcoes } from '../hooks/useTarefaOpcoes';
import { mapTarefaToResumida } from '../utils/tarefa';
import type { TarefaResumida } from '../schemas/tarefa';

export interface FiltroTarefa {
  responsavelId: string;
  situacaoId: string;
  tipoId: string;
  projetoId: string;
  busca: string;
  incluirEncerradas: boolean;
}

const FILTRO_INICIAL: FiltroTarefa = {
  responsavelId: '',
  situacaoId: '',
  tipoId: '',
  projetoId: '',
  busca: '',
  incluirEncerradas: false,
};

export function Tarefas() {
  const [tarefas, setTarefas] = useState<TarefaResumida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useAppSettings();
  const [filtros, setFiltros] = useState<FiltroTarefa>(FILTRO_INICIAL);
  const opcoes = useTarefaOpcoes();

  const carregarTarefas = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtros.responsavelId) params.append('responsavel_id', filtros.responsavelId);
      if (filtros.situacaoId) params.append('situacao_id', filtros.situacaoId);
      if (filtros.tipoId) params.append('tipo_id', filtros.tipoId);
      if (filtros.projetoId) params.append('projeto_id', filtros.projetoId);
      if (filtros.busca) params.append('busca', filtros.busca);
      if (filtros.incluirEncerradas) params.append('incluir_encerradas', 'true');

      const response = await api.get(`/tarefas?${params.toString()}`);
      setTarefas(response.data.map(mapTarefaToResumida));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefas();
  }, [filtros]);

  const situacoesFiltradas = filtros.situacaoId
    ? opcoes.situacoes.filter((s) => s.id === Number(filtros.situacaoId))
    : opcoes.situacoes;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500">Gerencie todas as tarefas</p>
        </div>
        <div className="flex items-center gap-3">
          <ViewModeToggle
            mode={settings.tarefasViewMode}
            onChange={(mode) => setSettings({ ...settings, tarefasViewMode: mode })}
          />
          <Link to="/tarefas/nova">
            <Button>
              <Plus size={18} />
              Nova tarefa
            </Button>
          </Link>
        </div>
      </div>

      <Card title="Filtros">
        <TarefaFilters filtros={filtros} onChange={setFiltros} opcoes={opcoes} />
      </Card>

      {settings.tarefasViewMode === 'list' ? (
        <Card title="Lista de tarefas">
          <TarefaList tarefas={tarefas} isLoading={isLoading} />
        </Card>
      ) : (
        <KanbanBoard
          tarefas={tarefas}
          situacoes={situacoesFiltradas}
          onTarefaMoved={carregarTarefas}
        />
      )}
    </div>
  );
}
