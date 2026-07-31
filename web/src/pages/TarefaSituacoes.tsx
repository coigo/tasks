import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { useApiData, useMutate } from '../hooks/useApi';
import { Pencil, Trash2, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface Situacao {
  id: number;
  descricao: string;
  encerra_tarefa: boolean;
}

const schema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  encerra_tarefa: z.boolean(),
});

type FormData = z.infer<typeof schema>;

export function TarefaSituacoes() {
  const { data: situacoes, refetch, isLoading } = useApiData<Situacao[]>({
    url: '/tarefas-situacoes',
  });
  const { execute: criar } = useMutate('/tarefas-situacoes', 'post');
  const { execute: atualizar } = useMutate('/tarefas-situacoes', 'put');
  const { execute: remover } = useMutate('/tarefas-situacoes', 'delete');
  const [editando, setEditando] = useState<Situacao | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { encerra_tarefa: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (editando) {
        await atualizar(data, `/tarefas-situacoes/${editando.id}`);
        toast.success('Situação atualizada');
      } else {
        await criar(data);
        toast.success('Situação criada');
      }
      reset();
      setEditando(null);
      refetch();
    } catch {
      toast.error('Erro ao salvar situação');
    }
  };

  const handleEditar = (situacao: Situacao) => {
    setEditando(situacao);
    setValue('descricao', situacao.descricao);
    setValue('encerra_tarefa', situacao.encerra_tarefa);
  };

  const handleRemover = async (id: number) => {
    if (!confirm('Deseja remover esta situação?')) return;
    try {
      await remover(undefined, `/tarefas-situacoes/${id}`);
      toast.success('Situação removida');
      refetch();
    } catch {
      toast.error('Erro ao remover situação');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Situações</h1>
        <p className="text-gray-500">Gerencie as situações das tarefas</p>
      </div>

      <Card title={editando ? 'Editar situação' : 'Nova situação'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormInput
            label="Descrição"
            placeholder="Ex: Pendente, Em andamento"
            error={errors.descricao?.message}
            {...register('descricao')}
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              {...register('encerra_tarefa')}
              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            Encerra tarefa (não aparece na lista de pendentes)
          </label>
          <div className="flex gap-2">
            <Button type="submit" isLoading={isSubmitting}>
              <Plus size={18} />
              {editando ? 'Atualizar' : 'Adicionar'}
            </Button>
            {editando && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditando(null);
                  reset();
                }}
              >
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <Card title="Lista de situações">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Carregando...</p>
        ) : situacoes?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma situação encontrada.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {situacoes?.map((situacao) => (
              <div
                key={situacao.id}
                className="flex items-center justify-between py-4 -mx-5 px-5 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900">{situacao.descricao}</span>
                  {situacao.encerra_tarefa && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                      <Check size={12} />
                      Encerra
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditar(situacao)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:text-danger-dark"
                    onClick={() => handleRemover(situacao.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
