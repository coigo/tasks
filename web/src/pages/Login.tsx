import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FormInput } from '../components/FormInput';
import { Button } from '../components/Button';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

const schema = z.object({
  usuario: z.string(),
  senha: z.string().min(1, 'Senha obrigatória'),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.usuario, data.senha);
      toast.success('Bem-vindo!');
      navigate('/');
    } catch {
      toast.error('Credenciais inválidas');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <ClipboardList size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Task Manager</h1>
          <p className="text-gray-500 mt-1">Faça login para continuar</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormInput
            label="Usuario"
            type="text"
            placeholder="user.name"
            error={errors.usuario?.message}
            {...register('usuario')}
          />
          <FormInput
            label="Senha"
            type="password"
            placeholder="••••••"
            error={errors.senha?.message}
            {...register('senha')}
          />
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Entrar
          </Button>
        </form>
      </div>
    </div>
  );
}
