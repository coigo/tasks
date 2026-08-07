import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Plus, Search, Filter, LayoutList, LayoutGrid } from 'lucide-react';
import { TarefaList } from '../components/TarefaList';
import { KanbanBoard } from '../components/KanbanBoard';
import type { KanbanTarefa } from '../components/KanbanCard';
import type { Situacao } from '../components/KanbanColumn';
import { useAppSettings } from '../hooks/useLocalStorage';

interface Filtro {
  responsavelId: string;
  situacaoId: string;
  tipoId: string;
  projetoId: string;
  busca: string;
  incluirEncerradas: boolean;
}

export function Tarefas() {
  const [tarefas, setTarefas] = useState<KanbanTarefa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useAppSettings();
  const [filtros, setFiltros] = useState<Filtro>({
    responsavelId: '',
    situacaoId: '',
    tipoId: '',
    projetoId: '',
    busca: '',
    incluirEncerradas: false,
  });
  const [opcoes, setOpcoes] = useState({
    usuarios: [] as Array<{ id: number; nome: string }>,
    situacoes: [] as Situacao[],
    tipos: [] as Array<{ id: number; descricao: string }>,
    projetos: [] as Array<{ id: number; nome: string }>,
  });

  useEffect(() => {
    const carregarOpcoes = async () => {
      const [usuariosRes, situacoesRes, tiposRes, projetosRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/tarefas-situacoes'),
        api.get('/tarefas-tipos'),
        api.get('/projetos'),
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
        projetos: projetosRes.data,
      });
    };
    carregarOpcoes();
  }, []);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
          <FormSelect
            label="Projeto"
            options={opcoes.projetos.map((p) => ({ value: p.id, label: p.nome }))}
            value={filtros.projetoId}
            onChange={(e) => setFiltros({ ...filtros, projetoId: e.target.value })}
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
