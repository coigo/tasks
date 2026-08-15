import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Plus, ArrowLeft } from 'lucide-react';
import { TarefaList } from '../components/TarefaList';
import { KanbanBoard } from '../components/KanbanBoard';
import { TarefaFilters } from '../components/TarefaFilters';
import { ViewModeToggle } from '../components/ViewModeToggle';
import { useAppSettings } from '../hooks/useLocalStorage';
import { useTarefaOpcoes } from '../hooks/useTarefaOpcoes';
import { mapTarefaToResumida } from '../utils/tarefa';
import type { TarefaResumida } from '../schemas/tarefa';
import type { FiltroTarefa } from '../pages/Tarefas';
import toast from 'react-hot-toast';

interface Projeto {
  id: number;
  nome: string;
}

const FILTRO_INICIAL: FiltroTarefa = {
  responsavelId: '',
  situacaoId: '',
  tipoId: '',
  projetoId: '',
  busca: '',
  incluirEncerradas: false,
};

export function ProjetoDetail() {
  const { id } = useParams<{ id: string }>();
  const [settings, setSettings] = useAppSettings();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [tarefas, setTarefas] = useState<TarefaResumida[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projetoLoading, setProjetoLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltroTarefa>(FILTRO_INICIAL);
  const opcoes = useTarefaOpcoes();

  useEffect(() => {
    const carregarProjeto = async () => {
      if (!id) return;
      setProjetoLoading(true);
      try {
        const response = await api.get(`/projetos/${id}`);
        setProjeto(response.data);
      } catch {
        toast.error('Projeto não encontrado');
      } finally {
        setProjetoLoading(false);
      }
    };
    carregarProjeto();
  }, [id]);

  const carregarTarefas = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('projeto_id', id);
      if (filtros.responsavelId) params.append('responsavel_id', filtros.responsavelId);
      if (filtros.situacaoId) params.append('situacao_id', filtros.situacaoId);
      if (filtros.tipoId) params.append('tipo_id', filtros.tipoId);
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
  }, [id, filtros]);

  const situacoesFiltradas = filtros.situacaoId
    ? opcoes.situacoes.filter((s) => s.id === Number(filtros.situacaoId))
    : opcoes.situacoes;

  if (projetoLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <p className="text-gray-500">Carregando projeto...</p>
      </div>
    );
  }

  if (!projeto) {
    return (
      <div className="space-y-6">
        <Link to="/projetos">
          <Button variant="ghost">
            <ArrowLeft size={18} />
            Voltar para Projetos
          </Button>
        </Link>
        <p className="text-gray-500">Projeto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/projetos">
            <Button variant="ghost">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{projeto.nome}</h1>
            <p className="text-gray-500">Tarefas do projeto</p>
          </div>
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
        <TarefaFilters filtros={filtros} onChange={setFiltros} opcoes={opcoes} hideProjeto />
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