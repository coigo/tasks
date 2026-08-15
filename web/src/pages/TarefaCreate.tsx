import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TarefaFormFields } from '../components/TarefaFormFields';
import { AnexosTemp } from '../components/AnexosTemp';
import { useMutate } from '../hooks/useApi';
import { useTarefaOpcoes } from '../hooks/useTarefaOpcoes';
import { tarefaSchema, type TarefaFormData, buildTarefaPayload } from '../schemas/tarefa';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface TarefaCriada {
  id: number;
  numero: number;
  ano: number;
}

export function TarefaCreate() {
  const navigate = useNavigate();
  const { execute: criar, isLoading: isSubmitting } = useMutate('/tarefas', 'post');
  const opcoes = useTarefaOpcoes();
  const [arquivosTemp, setArquivosTemp] = useState<Array<{ uuid: string; nome: string }>>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
  });

  const onSubmit: SubmitHandler<TarefaFormData> = async (data) => {
    try {
      const response = await criar<TarefaCriada>(
        buildTarefaPayload(data, { anexos: arquivosTemp.map((a) => a.uuid) })
      );
      toast.success('Tarefa criada');
      navigate(`/tarefas/${response.id}`);
    } catch {
      toast.error('Erro ao criar tarefa');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tarefas">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nova tarefa</h1>
          <p className="text-gray-500">Preencha os dados para criar uma nova tarefa</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card title="Dados da tarefa">
          <TarefaFormFields register={register} control={control} errors={errors} opcoes={opcoes} />
        </Card>

        <Card title="Anexos">
          <AnexosTemp
            uploadUrl="/tarefas/0/anexos/upload-temp"
            arquivos={arquivosTemp}
            onChange={setArquivosTemp}
          />
        </Card>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting}>
            <Save size={18} />
            Criar tarefa
          </Button>
        </div>
      </form>
    </div>
  );
}
