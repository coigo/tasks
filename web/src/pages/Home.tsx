import { useEffect, useState } from 'react';
import api from '../services/api';
import { Card } from '../components/Card';
import { Link } from 'react-router-dom';
import { ClipboardList, CheckCircle2, Clock } from 'lucide-react';
import { CORES_SITUACAO } from '../constants/coresSituacao';

interface Metricas {
  por_situacao: Array<{ id: number; descricao: string; encerra_tarefa: boolean; cor: string; total: number }>;
  por_tipo: Array<{ id: number; descricao: string; total: number }>;
  por_responsavel: Array<{ id: number; nome: string; total: number }>;
}

interface Tarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoDescricao: string;
  situacaoEncerraTarefa: boolean;
  situacaoCor: string;
  tipoDescricao: string;
  responsavelNome: string;
  projetoNome: string;
  ultimaMovEm: string;
}

export function Home() {
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [minhasTarefas, setMinhasTarefas] = useState<Tarefa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [metricasRes, tarefasRes] = await Promise.all([
          api.get('/relatorios/metricas'),
          api.get('/tarefas'),
        ]);
        setMetricas(metricasRes.data);
        setMinhasTarefas(tarefasRes.data.slice(0, 5));
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  const totalAtivas =
    metricas?.por_situacao
      .filter((s) => !s.encerra_tarefa)
      .reduce((acc, s) => acc + Number(s.total), 0) || 0;

  const totalEncerradas =
    metricas?.por_situacao
      .filter((s) => s.encerra_tarefa)
      .reduce((acc, s) => acc + Number(s.total), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Início</h1>
        <p className="text-gray-500">Visão geral das tarefas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
              <ClipboardList className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tarefas ativas</p>
              <p className="text-3xl font-bold text-gray-900">{totalAtivas}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-success/5 to-success/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success/20 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="text-success" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Encerradas</p>
              <p className="text-3xl font-bold text-gray-900">{totalEncerradas}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-warning/5 to-warning/10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning/20 rounded-xl flex items-center justify-center">
              <Clock className="text-warning" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total por responsável</p>
              <p className="text-3xl font-bold text-gray-900">
                {metricas?.por_responsavel.length || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Por situação">
          <div className="space-y-3">
            {metricas?.por_situacao.map((situacao) => (
              <div key={situacao.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: CORES_SITUACAO[situacao.cor]?.bg || '#6B7280' }}
                  />
                  <span className="text-gray-700">{situacao.descricao}</span>
                </div>
                <span className="font-semibold text-gray-900">{situacao.total}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Por tipo">
          <div className="space-y-3">
            {metricas?.por_tipo.map((tipo) => (
              <div key={tipo.id} className="flex items-center justify-between">
                <span className="text-gray-700">{tipo.descricao}</span>
                <span className="font-semibold text-gray-900">{tipo.total}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Tarefas recentes"
        action={
          <Link
            to="/tarefas"
            className="text-sm text-primary hover:text-primary-dark font-medium"
          >
            Ver todas
          </Link>
        }
      >
        {minhasTarefas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma tarefa encontrada.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {minhasTarefas.map((tarefa) => (
              <Link
                key={tarefa.id}
                to={`/tarefas/${tarefa.id}`}
                className="flex items-center justify-between py-4 hover:bg-gray-50 -mx-5 px-5 transition-colors"
              >
                  {
                     (() => {
                        console.log(JSON.stringify(tarefa))
                        return <></>
                     })()}
                <div>
                  <p className="font-medium text-gray-900">
                    #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
                  </p>
                     <p className="text-sm text-gray-500">
                    {tarefa.projetoNome} • {tarefa.responsavelNome}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    tarefa.situacaoEncerraTarefa
                      ? 'bg-success/10 text-success'
                      : 'bg-warning/10 text-warning'
                  }`}
                >
                  {tarefa.situacaoDescricao}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
