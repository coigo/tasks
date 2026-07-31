import { useState } from 'react';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormSelect } from '../components/FormSelect';
import { FormInput } from '../components/FormInput';
import { FileBarChart, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Tarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  responsavel_nome: string;
  situacao_descricao: string;
  tipo_descricao: string;
  projeto_nome: string;
  ultima_mov_em: string;
}

interface Usuario {
  id: number;
  nome: string;
}

export function Relatorios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [responsavelId, setResponsavelId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleBuscar = async () => {
    if (!dataInicio || !dataFim) {
      toast.error('Informe o período');
      return;
    }
    setIsLoading(true);
    try {
      const [usuariosRes, tarefasRes] = await Promise.all([
        api.get('/usuarios'),
        api.get(`/relatorios/periodo?data_inicio=${dataInicio}&data_fim=${dataFim}&responsavel_id=${responsavelId}`),
      ]);
      setUsuarios(usuariosRes.data);
      setTarefas(tarefasRes.data);
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <p className="text-gray-500">Acompanhe as tarefas movimentadas por período</p>
      </div>

      <Card title="Tarefas movimentadas por período">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <FormInput
            label="Data início"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <FormInput
            label="Data fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <FormSelect
            label="Responsável"
            options={usuarios.map((u) => ({ value: u.id, label: u.nome }))}
            value={responsavelId}
            onChange={(e) => setResponsavelId(e.target.value)}
          />
          <Button onClick={handleBuscar} isLoading={isLoading}>
            <Search size={18} />
            Buscar
          </Button>
        </div>
      </Card>

      <Card
        title="Resultado"
        action={
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileBarChart size={18} />
            {tarefas.length} tarefa(s)
          </div>
        }
      >
        {tarefas.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Selecione um período e clique em buscar.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tarefas.map((tarefa) => (
              <div key={tarefa.id} className="py-4 -mx-5 px-5 hover:bg-gray-50">
                <p className="font-medium text-gray-900">
                  #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
                </p>
                <p className="text-sm text-gray-500">
                  {tarefa.projeto_nome} • {tarefa.tipo_descricao} • {tarefa.situacao_descricao}
                </p>
                <p className="text-sm text-gray-500">
                  Responsável: {tarefa.responsavel_nome} • Última movimentação:{' '}
                  {format(new Date(tarefa.ultima_mov_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
