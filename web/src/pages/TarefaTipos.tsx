import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { useApiData, useMutate } from '../hooks/useApi';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Tipo {
  id: number;
  descricao: string;
}

const schema = z.object({
  descricao: z.string().min(1, 'Descrição é obrigatória'),
});

type FormData = z.infer<typeof schema>;

export function TarefaTipos() {
  const { data: tipos, refetch, isLoading } = useApiData<Tipo[]>({ url: '/tarefas-tipos' });
  const { execute: criar } = useMutate('/tarefas-tipos', 'post');
  const { execute: atualizar } = useMutate('/tarefas-tipos', 'put');
  const { execute: remover } = useMutate('/tarefas-tipos', 'delete');
  const [editando, setEditando] = useState<Tipo | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (editando) {
        await atualizar(data, `/tarefas-tipos/${editando.id}`);
        toast.success('Tipo atualizado');
      } else {
        await criar(data);
        toast.success('Tipo criado');
      }
      reset();
      setEditando(null);
      refetch();
    } catch {
      toast.error('Erro ao salvar tipo');
    }
  };

  const handleEditar = (tipo: Tipo) => {
    setEditando(tipo);
    setValue('descricao', tipo.descricao);
  };

  const handleRemover = async (id: number) => {
    if (!confirm('Deseja remover este tipo?')) return;
    try {
      await remover(undefined, `/tarefas-tipos/${id}`);
      toast.success('Tipo removido');
      refetch();
    } catch {
      toast.error('Erro ao remover tipo');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tipos</h1>
        <p className="text-gray-500">Gerencie os tipos de tarefas</p>
      </div>

      <Card title={editando ? 'Editar tipo' : 'Novo tipo'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-end">
          <div className="flex-1">
            <FormInput
              label="Descrição"
              placeholder="Ex: Bug, Feature, Suporte"
              error={errors.descricao?.message}
              {...register('descricao')}
            />
          </div>
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
        </form>
      </Card>

      <Card title="Lista de tipos">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Carregando...</p>
        ) : tipos?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum tipo encontrado.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {tipos?.map((tipo) => (
              <div
                key={tipo.id}
                className="flex items-center justify-between py-4 -mx-5 px-5 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{tipo.descricao}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditar(tipo)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:text-danger-dark"
                    onClick={() => handleRemover(tipo.id)}
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
