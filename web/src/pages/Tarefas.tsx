import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { Plus, Search, Filter } from 'lucide-react';

interface Tarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacao_descricao: string;
  situacao_encerra_tarefa: boolean;
  tipo_descricao: string;
  responsavel_nome: string;
  projeto_nome: string;
  ultima_mov_em: string;
}

interface Filtro {
  responsavel_id: string;
  situacao_id: string;
  tipo_id: string;
  projeto_id: string;
  busca: string;
  incluir_encerradas: boolean;
}

export function Tarefas() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filtros, setFiltros] = useState<Filtro>({
    responsavel_id: '',
    situacao_id: '',
    tipo_id: '',
    projeto_id: '',
    busca: '',
    incluir_encerradas: false,
  });
  const [opcoes, setOpcoes] = useState({
    usuarios: [] as Array<{ id: number; nome: string }>,
    situacoes: [] as Array<{ id: number; descricao: string }>,
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
        situacoes: situacoesRes.data,
        tipos: tiposRes.data,
        projetos: projetosRes.data,
      });
    };
    carregarOpcoes();
  }, []);

  useEffect(() => {
    const carregarTarefas = async () => {
      setIsLoading(false);
      try {
        const params = new URLSearchParams();
        if (filtros.responsavel_id) params.append('responsavel_id', filtros.responsavel_id);
        if (filtros.situacao_id) params.append('situacao_id', filtros.situacao_id);
        if (filtros.tipo_id) params.append('tipo_id', filtros.tipo_id);
        if (filtros.projeto_id) params.append('projeto_id', filtros.projeto_id);
        if (filtros.busca) params.append('busca', filtros.busca);
        if (filtros.incluir_encerradas) params.append('incluir_encerradas', 'true');

        const response = await api.get(`/tarefas?${params.toString()}`);
        setTarefas(response.data);
      } finally {
        setIsLoading(false);
      }
    };
    carregarTarefas();
  }, [filtros]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="text-gray-500">Gerencie todas as tarefas</p>
        </div>
        <Link to="/tarefas/nova">
          <Button>
            <Plus size={18} />
            Nova tarefa
          </Button>
        </Link>
      </div>

      <Card title="Filtros">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <FormSelect
            label="Responsável"
            options={opcoes.usuarios.map((u) => ({ value: u.id, label: u.nome }))}
            value={filtros.responsavel_id}
            onChange={(e) => setFiltros({ ...filtros, responsavel_id: e.target.value })}
          />
          <FormSelect
            label="Situação"
            options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
            value={filtros.situacao_id}
            onChange={(e) => setFiltros({ ...filtros, situacao_id: e.target.value })}
          />
          <FormSelect
            label="Tipo"
            options={opcoes.tipos.map((t) => ({ value: t.id, label: t.descricao }))}
            value={filtros.tipo_id}
            onChange={(e) => setFiltros({ ...filtros, tipo_id: e.target.value })}
          />
          <FormSelect
            label="Projeto"
            options={opcoes.projetos.map((p) => ({ value: p.id, label: p.nome }))}
            value={filtros.projeto_id}
            onChange={(e) => setFiltros({ ...filtros, projeto_id: e.target.value })}
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
            checked={filtros.incluir_encerradas}
            onChange={(e) => setFiltros({ ...filtros, incluir_encerradas: e.target.checked })}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          Incluir tarefas encerradas
        </label>
      </Card>

      <Card title="Lista de tarefas">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Carregando...</p>
        ) : tarefas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada.</p>
        ) : (
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
                    {tarefa.projeto_nome} • {tarefa.tipo_descricao} • Responsável: {tarefa.responsavel_nome}
                  </p>
                </div>
                <span
                  className={`self-start px-3 py-1 rounded-full text-xs font-medium ${
                    tarefa.situacao_encerra_tarefa
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {tarefa.situacao_descricao}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
