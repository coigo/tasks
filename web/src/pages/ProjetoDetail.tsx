import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Plus, Search, Filter, LayoutList, LayoutGrid, ArrowLeft } from 'lucide-react';
import { TarefaList } from '../components/TarefaList';
import { KanbanBoard } from '../components/KanbanBoard';
import type { KanbanTarefa } from '../components/KanbanCard';
import type { Situacao } from '../components/KanbanColumn';
import { useAppSettings } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

interface Projeto {
  id: number;
  nome: string;
}

interface Filtro {
  responsavelId: string;
  situacaoId: string;
  tipoId: string;
  busca: string;
  incluirEncerradas: boolean;
}

export function ProjetoDetail() {
  const { id } = useParams<{ id: string }>();
  const [settings, setSettings] = useAppSettings();
  const [projeto, setProjeto] = useState<Projeto | null>(null);
  const [tarefas, setTarefas] = useState<KanbanTarefa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [projetoLoading, setProjetoLoading] = useState(true);
  const [filtros, setFiltros] = useState<Filtro>({
    responsavelId: '',
    situacaoId: '',
    tipoId: '',
    busca: '',
    incluirEncerradas: false,
  });
  const [opcoes, setOpcoes] = useState({
    usuarios: [] as Array<{ id: number; nome: string }>,
    situacoes: [] as Situacao[],
    tipos: [] as Array<{ id: number; descricao: string }>,
  });

  useEffect(() => {
    const carregarOpcoes = async () => {
      const [usuariosRes, situacoesRes, tiposRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/tarefas-situacoes'),
        api.get('/tarefas-tipos'),
      ]);
      setOpcoes({
        usuarios: usuariosRes.data,
        situacoes: situacoesRes.data.map((s: { id: number; descricao: string; encerra_tarefa: boolean; cor: string }) => ({
          id: s.id,
          descricao: s.descricao,
          cor: s.cor || 'gray',
          encerra_tarefa: s.encerra_tarefa,
        })),
        tipos: tiposRes.data,
      });
    };
    carregarOpcoes();
  }, []);

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
      const tarefasData = response.data.map((t: {
        id: number;
        numero: number;
        ano: number;
        titulo: string;
        situacaoId: number;
        situacaoDescricao: string;
        situacaoCor: string;
        situacaoEncerraTarefa: boolean;
        tipoDescricao: string;
        responsavelNome: string;
        projetoNome: string;
        prazo: string | null;
      }) => ({
        id: t.id,
        numero: t.numero,
        ano: t.ano,
        titulo: t.titulo,
        situacaoId: t.situacaoId,
        situacaoDescricao: t.situacaoDescricao,
        situacaoCor: t.situacaoCor || 'gray',
        tipoDescricao: t.tipoDescricao,
        responsavelNome: t.responsavelNome,
        projetoNome: t.projetoNome,
        prazo: t.prazo || null,
      }));
      setTarefas(tarefasData);
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
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setSettings({ ...settings, tarefasViewMode: 'list' })}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors ${
                settings.tarefasViewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutList size={16} />
              Lista
            </button>
            <button
              onClick={() => setSettings({ ...settings, tarefasViewMode: 'kanban' })}
              className={`px-3 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors ${
                settings.tarefasViewMode === 'kanban'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <LayoutGrid size={16} />
              Kanban
            </button>
          </div>
          <Link to="/tarefas/nova">
            <Button>
              <Plus size={18} />
              Nova tarefa
            </Button>
          </Link>
        </div>
      </div>

      <Card title="Filtros">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormSelect
            label="Responsável"
            options={opcoes.usuarios.map((u) => ({ value: u.id, label: u.nome }))}
            value={filtros.responsavelId}
            onChange={(e) => setFiltros({ ...filtros, responsavelId: e.target.value })}
          />
          <FormSelect
            label="Situação"
            options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
            value={filtros.situacaoId}
            onChange={(e) => setFiltros({ ...filtros, situacaoId: e.target.value })}
          />
          <FormSelect
            label="Tipo"
            options={opcoes.tipos.map((t) => ({ value: t.id, label: t.descricao }))}
            value={filtros.tipoId}
            onChange={(e) => setFiltros({ ...filtros, tipoId: e.target.value })}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Busca</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar tarefa..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                value={filtros.busca}
                onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
              />
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 mt-4 text-sm text-gray-700">
          <Filter size={16} />
          <input
            type="checkbox"
            checked={filtros.incluirEncerradas}
            onChange={(e) => setFiltros({ ...filtros, incluirEncerradas: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Incluir tarefas encerradas
        </label>
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