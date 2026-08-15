import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TarefaFormFields } from '../components/TarefaFormFields';
import { useMutate } from '../hooks/useApi';
import { ArrowLeft, Save, Paperclip, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Opcoes {
  usuarios: Array<{ id: number; nome: string }>;
  situacoes: Array<{ id: number; descricao: string; encerraTarefa: boolean }>;
  tipos: Array<{ id: number; descricao: string }>;
  projetos: Array<{ id: number; nome: string }>;
}

interface TarefaCriada {
  id: number;
  numero: number;
  ano: number;
}

const schema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string(),
  projetoId: z.string().min(1, 'Projeto é obrigatório'),
  responsavelId: z.string().min(1, 'Responsável é obrigatório'),
  situacaoId: z.string().min(1, 'Situação é obrigatória'),
  tipoId: z.string().min(1, 'Tipo é obrigatório'),
  inicioPrevisto: z.string().optional(),
  prazo: z.string().optional(),
}).refine((data) => {
  if (data.prazo && data.inicioPrevisto) {
    return new Date(data.prazo) >= new Date(data.inicioPrevisto);
  }
  return true;
}, {
  message: 'Prazo deve ser maior ou igual ao início previsto',
  path: ['prazo'],
});

type FormData = z.infer<typeof schema>;

export function TarefaCreate() {
  const navigate = useNavigate();
  const { execute: criar, isLoading: isSubmitting } = useMutate('/tarefas', 'post');
  const [opcoes, setOpcoes] = useState<Opcoes>({
    usuarios: [],
    situacoes: [],
    tipos: [],
    projetos: [],
  });
  const [arquivosTemp, setArquivosTemp] = useState<Array<{ uuid: string; nome: string }>>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
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

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const payload: Record<string, unknown> = {
        titulo: data.titulo,
        descricao: data.descricao,
        projetoId: Number(data.projetoId),
        responsavelId: Number(data.responsavelId),
        situacaoId: Number(data.situacaoId),
        tipoId: Number(data.tipoId),
        anexos: arquivosTemp.map((a) => a.uuid),
      };
      if (data.inicioPrevisto) {
        payload.inicioPrevisto = data.inicioPrevisto;
      }
      if (data.prazo) {
        payload.prazo = data.prazo;
      }
      const response = await criar<TarefaCriada>(payload);
      toast.success('Tarefa criada');
      navigate(`/tarefas/${response.id}`);
    } catch {
      toast.error('Erro ao criar tarefa');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    try {
      const response = await api.post('/tarefas/0/anexos/upload-temp', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setArquivosTemp([...arquivosTemp, { uuid: response.data.uuid, nome: response.data.nome }]);
      toast.success('Arquivo adicionado');
    } catch {
      toast.error('Erro ao anexar arquivo');
    }
  };

  const handleRemoverTemp = (uuid: string) => {
    setArquivosTemp(arquivosTemp.filter((a) => a.uuid !== uuid));
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
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer w-fit text-sm text-gray-700">
                <Paperclip size={18} />
                Anexar arquivo
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </div>

            {arquivosTemp.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Arquivos pendentes:</p>
                {arquivosTemp.map((arquivo) => (
                  <div
                    key={arquivo.uuid}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{arquivo.nome}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-danger"
                      onClick={() => handleRemoverTemp(arquivo.uuid)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
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
