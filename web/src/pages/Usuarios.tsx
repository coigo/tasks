import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { useApiData, useMutate } from '../hooks/useApi';
import { Pencil, Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

interface Usuario {
  id: number;
  nome: string;
  usuario: string;
}

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  usuario: z.string(),
  senha: z.string().min(4, 'Senha deve ter no mínimo 4 caracteres').optional(),
});

type FormData = z.infer<typeof schema>;

export function Usuarios() {
  const { data: usuarios, refetch, isLoading } = useApiData<Usuario[]>({ url: '/usuarios' });
  const { execute: criar } = useMutate('/usuarios', 'post');
  const { execute: atualizar } = useMutate('/usuarios', 'put');
  const { execute: remover } = useMutate('/usuarios', 'delete');
  const [editando, setEditando] = useState<Usuario | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      if (editando) {
        const payload = { ...data };
        if (!payload.senha) delete (payload as { senha?: string }).senha;
        await atualizar(payload, `/usuarios/${editando.id}`);
        toast.success('Usuário atualizado');
      } else {
        const payload = { ...data, senha: data.senha || '' };
        await criar(payload);
        toast.success('Usuário criado');
      }
      reset();
      setEditando(null);
      refetch();
    } catch {
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setEditando(usuario);
    setValue('nome', usuario.nome);
    setValue('usuario', usuario.usuario);
    setValue('senha', '');
  };

  const handleRemover = async (id: number) => {
    if (!confirm('Deseja remover este usuário?')) return;
    try {
      await remover(undefined, `/usuarios/${id}`);
      toast.success('Usuário removido');
      refetch();
    } catch {
      toast.error('Erro ao remover usuário');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
        <p className="text-gray-500">Gerencie os usuários do sistema</p>
      </div>

      <Card title={editando ? 'Editar usuário' : 'Novo usuário'}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <FormInput
            label="Nome"
            placeholder="Nome completo"
            error={errors.nome?.message}
            {...register('nome')}
          />
          <FormInput
            label="E-mail"
            type="usuario"
            placeholder="usuario@tasks.local"
            error={errors.usuario?.message}
            {...register('usuario')}
          />
          <FormInput
            label={editando ? 'Senha (deixe em branco para manter)' : 'Senha'}
            type="password"
            placeholder="••••••"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <div className="md:col-span-3 flex gap-2">
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

      <Card title="Lista de usuários">
        {isLoading ? (
          <p className="text-gray-500 text-center py-8">Carregando...</p>
        ) : usuarios?.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhum usuário encontrado.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {usuarios?.map((usuario) => (
              <div
                key={usuario.id}
                className="flex items-center justify-between py-4 -mx-5 px-5 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{usuario.nome}</p>
                  <p className="text-sm text-gray-500">{usuario.usuario}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditar(usuario)}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:text-danger-dark"
                    onClick={() => handleRemover(usuario.id)}
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
