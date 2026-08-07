import { useEffect, useState, useMemo } from 'react';
import api from '../services/api';
import { Card } from '../components/Card';
import { FormInput } from '../components/FormInput';
import { FileBarChart, FolderKanban, ListTodo, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PeriodoOpcao = 'essa_semana' | 'esse_mes' | 'esse_ano' | 'data_definida';

interface Metricas {
  total_projetos: number;
  tarefas_abertas: number;
  tarefas_encerradas: number;
}

interface Tarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  responsavelNome: string;
  situacaoDescricao: string;
  tipoDescricao: string;
  projetoNome: string;
  ultimaMovEm: string;
}

export function Relatorios() {
  const [periodo, setPeriodo] = useState<PeriodoOpcao>('essa_semana');
  const [dataInicioInput, setDataInicioInput] = useState('');
  const [dataFimInput, setDataFimInput] = useState('');
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [metricas, setMetricas] = useState<Metricas>({
    total_projetos: 0,
    tarefas_abertas: 0,
    tarefas_encerradas: 0,
  });
  const [, setIsLoading] = useState(false);
  const [isLoadingMetricas, setIsLoadingMetricas] = useState(false);

  const { dataInicio, dataFim } = useMemo(() => {
    const now = new Date();
    let inicio: Date;
    let fim: Date;

    switch (periodo) {
      case 'essa_semana': {
        inicio = startOfWeek(now, { weekStartsOn: 1 });
        fim = endOfWeek(now, { weekStartsOn: 1 });
        break;
      }
      case 'esse_mes':
        inicio = startOfMonth(now);
        fim = endOfMonth(now);
        break;
      case 'esse_ano':
        inicio = startOfYear(now);
        fim = endOfYear(now);
        break;
      case 'data_definida':
        inicio = dataInicioInput ? new Date(dataInicioInput) : new Date();
        fim = dataFimInput ? new Date(dataFimInput) : new Date();
        fim.setHours(23, 59, 59, 999);
        break;
    }

    return {
      dataInicio: format(inicio, 'yyyy-MM-dd'),
      dataFim: format(fim, 'yyyy-MM-dd'),
    };
  }, [periodo, dataInicioInput, dataFimInput]);

  const carregarMetricas = async () => {
    setIsLoadingMetricas(true);
    try {
      const response = await api.get(`/relatorios/metricas?data_inicio=${dataInicio}&data_fim=${dataFim}`);
      setMetricas(response.data);
    } catch {
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoadingMetricas(false);
    }
  };

  const carregarTarefas = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/relatorios/periodo?data_inicio=${dataInicio}&data_fim=${dataFim}`);
      setTarefas(response.data);
    } catch {
      toast.error('Erro ao carregar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarMetricas();
  }, [dataInicio, dataFim]);

  useEffect(() => {
    carregarTarefas();
  }, [dataInicio, dataFim]);

  const periodoButtons: { value: PeriodoOpcao; label: string }[] = [
    { value: 'essa_semana', label: 'Essa semana' },
    { value: 'esse_mes', label: 'Esse mês' },
    { value: 'esse_ano', label: 'Esse ano' },
    { value: 'data_definida', label: 'Data definida' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Acompanhe as métricas e tarefas por período</p>
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {periodoButtons.map((btn) => (
            <button
              key={btn.value}
              onClick={() => setPeriodo(btn.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                periodo === btn.value
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {periodo === 'data_definida' && (
          <div className="flex gap-4 items-end">
            <div className="w-40">
              <FormInput
                label="Data início"
                type="date"
                value={dataInicioInput}
                onChange={(e) => setDataInicioInput(e.target.value)}
              />
            </div>
            <div className="w-40">
              <FormInput
                label="Data fim"
                type="date"
                value={dataFimInput}
                onChange={(e) => setDataFimInput(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="text-sm text-gray-500">
          Período: {format(new Date(dataInicio), 'dd/MM/yyyy', { locale: ptBR })} - {format(new Date(dataFim), 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FolderKanban className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total de Projetos</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingMetricas ? '-' : metricas.total_projetos}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ListTodo className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tarefas Abertas</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingMetricas ? '-' : metricas.tarefas_abertas}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Encerradas no Período</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoadingMetricas ? '-' : metricas.tarefas_encerradas}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title="Tarefas movimentadas no período"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileBarChart size={18} />
            {tarefas.length} tarefa(s)
          </div>
        }
      >
        {tarefas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma tarefa movimentada no período selecionado.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tarefas.map((tarefa) => (
              <div key={tarefa.id} className="py-4 -mx-5 px-5 hover:bg-gray-50">
                <p className="font-medium text-gray-900">
                  #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
                </p>
                <p className="text-sm text-gray-500">
                  {tarefa.projetoNome} • {tarefa.tipoDescricao} • {tarefa.situacaoDescricao}
                </p>
                <p className="text-sm text-gray-500">
                  Responsável: {tarefa.responsavelNome} • Última movimentação:{' '}
                  {format(new Date(tarefa.ultimaMovEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}