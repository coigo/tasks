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

interface Projeto {
  id: number;
  nome: string;
  criado_em: string;
}

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
});

type FormData = z.infer<typeof schema>;

export function Projetos() {
  const { data: projetos, refetch, isLoading } = useApiData<Projeto[]>({ url: '/projetos' });
  const { execute: criar } = useMutate('/projetos', 'post');
  const { execute: atualizar } = useMutate('/projetos', 'put');
  const { execute: remover } = useMutate('/projetos', 'delete');
  const [editando, setEditando] = useState<Projeto | null>(null);

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
        await atualizar(data, `/projetos/${editando.id}`);
        toast.success('Projeto atualizado');
      } else {
        await criar(data);
        toast.success('Projeto criado');
      }
      reset();
      setEditando(null);
      refetch();
    } catch {
      toast.error('Erro ao salvar projeto');
    }
  };

  const handleEditar = (projeto: Projeto) => {
    setEditando(projeto);
    setValue('nome', projeto.nome);
  };

  const handleRemover = async (id: number) => {
    if (!confirm('Deseja remover este projeto?')) return;
    try {
      await remover(undefined, `/projetos/${id}`);
      toast.success('Projeto removido');
      refetch();
    } catch {
      toast.error('Erro ao remover projeto');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Projetos</h1>
        <p className="text-gray-500">Gerencie os projetos das tarefas</p>
      </div>

      <Card title={editando ? 'Editar projeto' : 'Novo projeto'}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 items-end">
          <div className="flex-1">
            <FormInput
              label="Nome"
              placeholder="Nome do projeto"
              error={errors.nome?.message}
              {...register('nome')}
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

      <Card title="Lista de projetos">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Carregando...</p>
        ) : projetos?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum projeto encontrado.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {projetos?.map((projeto) => (
              <div
                key={projeto.id}
                className="flex items-center justify-between py-4 -mx-5 px-5 hover:bg-gray-50"
              >
                <span className="font-medium text-gray-900">{projeto.nome}</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditar(projeto)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:text-danger-dark"
                    onClick={() => handleRemover(projeto.id)}
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
