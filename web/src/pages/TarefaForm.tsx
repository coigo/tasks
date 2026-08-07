import { useEffect, useState } from 'react';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { FormInput } from '../components/FormInput';
import { FormSelect } from '../components/FormSelect';
import { RichTextEditor } from '../components/RichTextEditor';
import { useMutate } from '../hooks/useApi';
import { ArrowLeft, Plus, Paperclip, Download, Trash2, MessageSquare, Save, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Tarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  descricao: string;
  projeto_id: number;
  responsavel_id: number;
  situacao_id: number;
  tipo_id: number;
  inicio_previsto: string | null;
  prazo: string | null;
  criado_por_nome: string;
  responsavel_nome: string;
  situacao_descricao: string;
  tipo_descricao: string;
  projeto_nome: string;
  situacao_encerra_tarefa: boolean;
  criado_em: string;
  ultima_mov_em: string;
}

interface Movimentacao {
  id: number;
  situacao_id: number;
  situacao_descricao: string;
  descricao: string;
  criado_por_nome: string;
  criado_em: string;
}

interface Anexo {
  id: number;
  uuid: string;
  nome: string;
  local: string;
  tamanho: number;
  criado_em: string;
}

interface Opcoes {
  usuarios: Array<{ id: number; nome: string }>;
  situacoes: Array<{ id: number; descricao: string; encerra_tarefa: boolean }>;
  tipos: Array<{ id: number; descricao: string }>;
  projetos: Array<{ id: number; nome: string }>;
}

const schema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string(),
  projeto_id: z.string().min(1, 'Projeto é obrigatório'),
  responsavel_id: z.string().min(1, 'Responsável é obrigatório'),
  situacao_id: z.string().min(1, 'Situação é obrigatória'),
  tipo_id: z.string().min(1, 'Tipo é obrigatório'),
  inicio_previsto: z.string().optional(),
  prazo: z.string().optional(),
}).refine((data) => {
  if (data.prazo && data.inicio_previsto) {
    return new Date(data.prazo) >= new Date(data.inicio_previsto);
  }
  return true;
}, {
  message: 'Prazo deve ser maior ou igual ao início previsto',
  path: ['prazo'],
});

   type FormData = z.infer<typeof schema>;
   
   export function TarefaForm() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const isNova = id === 'nova';
   const tarefaId = isNova ? null : Number(id);
   
   const [tarefa, setTarefa] = useState<Tarefa | null>(null);
   const [opcoes, setOpcoes] = useState<Opcoes>({
      usuarios: [],
      situacoes: [],
      tipos: [],
      projetos: [],
   });
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [arquivosTemp, setArquivosTemp] = useState<Array<{ uuid: string; nome: string }>>([]);
  const [isLoading, setIsLoading] = useState(isNova);
  const [novaMovimentacao, setNovaMovimentacao] = useState({ situacao_id: '', descricao: '' });
  const [editandoMovimentacao, setEditandoMovimentacao] = useState<Movimentacao | null>(null);

  const { execute: salvar } = useMutate('/tarefas', isNova ? 'post' : 'put');
  const { execute: criarMovimentacao } = useMutate('/tarefas', 'post');
  const { execute: atualizarMovimentacao } = useMutate('/tarefas', 'put');
  const { execute: removerMovimentacao } = useMutate('/tarefas', 'delete');
  const { execute: removerAnexo } = useMutate('/tarefas', 'delete');

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
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

  useEffect(() => {
    if (!tarefaId) return;

    const carregarTarefa = async () => {
      setIsLoading(true);
      try {
        const [tarefaRes, movimentacoesRes, anexosRes] = await Promise.all([
          api.get(`/tarefas/${tarefaId}`),
          api.get(`/tarefas/${tarefaId}/movimentacoes`),
          api.get(`/tarefas/${tarefaId}/anexos`),
        ]);
        setTarefa(tarefaRes.data);
        setMovimentacoes(movimentacoesRes.data);
        setAnexos(anexosRes.data);
        reset({
          titulo: tarefaRes.data.titulo,
          descricao: tarefaRes.data.descricao || '',
          projeto_id: String(tarefaRes.data.projeto_id),
          responsavel_id: String(tarefaRes.data.responsavel_id),
          situacao_id: String(tarefaRes.data.situacao_id),
          tipo_id: String(tarefaRes.data.tipo_id),
          inicio_previsto: tarefaRes.data.inicio_previsto || '',
          prazo: tarefaRes.data.prazo || '',
        });
      } catch {
        toast.error('Erro ao carregar tarefa'); 
      } finally {
        setIsLoading(false);
      }
    };
    carregarTarefa();
  }, [tarefaId, reset]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const payload: Record<string, unknown> = {
        titulo: data.titulo,
        descricao: data.descricao,
        projeto_id: Number(data.projeto_id),
        responsavel_id: Number(data.responsavel_id),
        situacao_id: Number(data.situacao_id),
        tipo_id: Number(data.tipo_id),
        anexos: arquivosTemp.map((a) => a.uuid),
      };
      if (data.inicio_previsto) {
        payload.inicio_previsto = data.inicio_previsto;
      }
      if (data.prazo) {
        payload.prazo = data.prazo;
      }
      let response;
      if (isNova) {
        response = await salvar<Tarefa>(payload);
      } else {
        response = await salvar<Tarefa>(payload, `/tarefas/${tarefaId}`);
      }
      toast.success(isNova ? 'Tarefa criada' : 'Tarefa atualizada');
      if (isNova && response) {
        navigate(`/tarefas/${response.id}`);
      } else {
        setArquivosTemp([]);
      }
    } catch {
      toast.error('Erro ao salvar tarefa');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    try {
      const response = await api.post(`/tarefas/0/anexos/upload-temp`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setArquivosTemp([...arquivosTemp, { uuid: response.data.uuid, nome: response.data.nome }]);
      toast.success('Arquivo anexado');
    } catch {
      toast.error('Erro ao anexar arquivo');
    }
  };

  const handleRemoverTemp = (uuid: string) => {
    setArquivosTemp(arquivosTemp.filter((a) => a.uuid !== uuid));
  };

  const handleDownloadAnexo = async (anexo: Anexo) => {
    try {
      const response = await api.get(`/tarefas/${tarefaId}/anexos/${anexo.id}/url`);
      window.open(response.data.url, '_blank');
    } catch {
      toast.error('Erro ao gerar link de download');
    }
  };

  const handleRemoverAnexo = async (anexoId: number) => {
    if (!confirm('Deseja remover este anexo?')) return;
    try {
      await removerAnexo(undefined, `/tarefas/${tarefaId}/anexos/${anexoId}`);
      setAnexos(anexos.filter((a) => a.id !== anexoId));
      toast.success('Anexo removido');
    } catch {
      toast.error('Erro ao remover anexo');
    }
  };

  const handleAdicionarMovimentacao = async () => {
    if (!novaMovimentacao.situacao_id) {
      toast.error('Selecione uma situação');
      return;
    }
    try {
      await criarMovimentacao(
        {
          situacao_id: Number(novaMovimentacao.situacao_id),
          descricao: novaMovimentacao.descricao,
        },
        `/tarefas/${tarefaId}/movimentacoes`
      );
      setNovaMovimentacao({ situacao_id: '', descricao: '' });
      const response = await api.get(`/tarefas/${tarefaId}/movimentacoes`);
      setMovimentacoes(response.data);
      const tarefaResponse = await api.get(`/tarefas/${tarefaId}`);
      setTarefa(tarefaResponse.data);
      setValue('situacao_id', novaMovimentacao.situacao_id);
      toast.success('Movimentação registrada');
    } catch {
      toast.error('Erro ao registrar movimentação');
    }
  };

  const handleAtualizarMovimentacao = async () => {
    if (!editandoMovimentacao) return;
    try {
      await atualizarMovimentacao(
        { descricao: editandoMovimentacao.descricao },
        `/tarefas/${tarefaId}/movimentacoes/${editandoMovimentacao.id}`
      );
      setEditandoMovimentacao(null);
      const response = await api.get(`/tarefas/${tarefaId}/movimentacoes`);
      setMovimentacoes(response.data);
      toast.success('Movimentação atualizada');
    } catch {
      toast.error('Erro ao atualizar movimentação');
    }
  };

  const handleRemoverMovimentacao = async (movimentacaoId: number) => {
    if (!confirm('Deseja remover esta movimentação?')) return;
    try {
      await removerMovimentacao(undefined, `/tarefas/${tarefaId}/movimentacoes/${movimentacaoId}`);
      setMovimentacoes(movimentacoes.filter((m) => m.id !== movimentacaoId));
      toast.success('Movimentação removida');
    } catch {
      toast.error('Erro ao remover movimentação');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/tarefas">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={18} />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isNova ? 'Nova tarefa' : `Tarefa #${tarefa?.numero}/${tarefa?.ano}`}
          </h1>
          {!isNova && tarefa && (
            <p className="text-sm text-gray-500">
              Criada por {tarefa.criado_por_nome} em{' '}
              {format(new Date(tarefa.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card title="Dados da tarefa">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormInput
              label="Título"
              placeholder="Título da tarefa"
              error={errors.titulo?.message}
              {...register('titulo')}
            />
            <FormSelect
              label="Projeto"
              options={opcoes.projetos.map((p) => ({ value: p.id, label: p.nome }))}
              error={errors.projeto_id?.message}
              {...register('projeto_id')}
            />
            <FormSelect
              label="Responsável"
              options={opcoes.usuarios.map((u) => ({ value: u.id, label: u.nome }))}
              error={errors.responsavel_id?.message}
              {...register('responsavel_id')}
            />
            <FormSelect
              label="Situação"
              options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
              error={errors.situacao_id?.message}
              {...register('situacao_id')}
            />
            <FormSelect
              label="Tipo"
              options={opcoes.tipos.map((t) => ({ value: t.id, label: t.descricao }))}
              error={errors.tipo_id?.message}
              {...register('tipo_id')}
            />
            <FormInput
              label="Início Previsto"
              type="date"
              error={errors.inicio_previsto?.message}
              {...register('inicio_previsto')}
            />
            <FormInput
              label="Prazo"
              type="date"
              error={errors.prazo?.message}
              {...register('prazo')}
            />
          </div>
          <Controller
            name="descricao"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                label="Descrição"
                value={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />
          <div className="mt-6 flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              <Save size={18} />
              {isNova ? 'Criar tarefa' : 'Salvar alterações'}
            </Button>
          </div>
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

            {!isNova && anexos.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Arquivos anexados:</p>
                {anexos.map((anexo) => (
                  <div
                    key={anexo.id}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-700">{anexo.nome}</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadAnexo(anexo)}
                      >
                        <Download size={16} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        onClick={() => handleRemoverAnexo(anexo.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </form>

      {!isNova && (
        <Card title="Movimentações">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <FormSelect
                label="Nova situação"
                options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
                value={novaMovimentacao.situacao_id}
                onChange={(e) =>
                  setNovaMovimentacao({ ...novaMovimentacao, situacao_id: e.target.value })
                }
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Detalhes</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Descreva a movimentação (suporta HTML)"
                    value={novaMovimentacao.descricao}
                    onChange={(e) =>
                      setNovaMovimentacao({ ...novaMovimentacao, descricao: e.target.value })
                    }
                  />
                  <Button onClick={handleAdicionarMovimentacao}>
                    <Plus size={18} />
                    Registrar
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {movimentacoes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhuma movimentação registrada.</p>
              ) : (
                movimentacoes.map((movimentacao) => (
                  <div
                    key={movimentacao.id}
                    className="border border-gray-200 rounded-lg p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={16} className="text-primary" />
                        <span className="font-medium text-gray-900">
                          {movimentacao.situacao_descricao}
                        </span>
                        <span className="text-sm text-gray-500">
                          por {movimentacao.criado_por_nome}
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {format(new Date(movimentacao.criado_em), 'dd/MM/yyyy HH:mm', {
                          locale: ptBR,
                        })}
                      </span>
                    </div>

                    {editandoMovimentacao?.id === movimentacao.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          value={editandoMovimentacao.descricao}
                          onChange={(e) =>
                            setEditandoMovimentacao({
                              ...editandoMovimentacao,
                              descricao: e.target.value,
                            })
                          }
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleAtualizarMovimentacao}>
                            Salvar
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditandoMovimentacao(null)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="text-sm text-gray-700 prose"
                          dangerouslySetInnerHTML={{
                            __html: movimentacao.descricao || 'Sem detalhes',
                          }}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditandoMovimentacao(movimentacao)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-danger"
                            onClick={() => handleRemoverMovimentacao(movimentacao.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

