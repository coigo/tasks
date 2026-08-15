import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TarefaFormFields } from '../components/TarefaFormFields';
import { FormSelect } from '../components/FormSelect';
import { Tabs, TabPanel } from '../components/Tabs';
import { useMutate } from '../hooks/useApi';
import {
  ArrowLeft,
  Plus,
  Paperclip,
  Trash2,
  MessageSquare,
  Save,
  Pencil,
  FileText,
  Files,
  History,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CORES_SITUACAO } from '../constants/coresSituacao';

interface Tarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  descricao: string;
  projetoId: number;
  responsavelId: number;
  situacaoId: number;
  tipoId: number;
  inicioPrevisto: string | null;
  prazo: string | null;
  tarefaPaiId: number | null;
  criadoPorNome: string;
  responsavelNome: string;
  situacaoDescricao: string;
  situacaoCor: string;
  tipoDescricao: string;
  projetoNome: string;
  situacaoEncerraTarefa: boolean;
  criadoEm: string;
  ultimaMovEm: string;
}

interface Subtarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoDescricao: string;
  situacaoCor: string;
  responsavelNome: string;
}

interface Movimentacao {
  id: number;
  situacaoId: number;
  situacaoDescricao: string;
  descricao: string;
  criadoPorNome: string;
  criadoEm: string;
}

interface Anexo {
  id: number;
  uuid: string;
  nome: string;
  local: string;
  tamanho: number;
  criadoEm: string;
}

interface Opcoes {
  usuarios: Array<{ id: number; nome: string }>;
  situacoes: Array<{ id: number; descricao: string; encerraTarefa: boolean }>;
  tipos: Array<{ id: number; descricao: string }>;
  projetos: Array<{ id: number; nome: string }>;
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

export function TarefaDetail() {
  const { id } = useParams<{ id: string }>();
  const tarefaId = Number(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');

  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [opcoes, setOpcoes] = useState<Opcoes>({
    usuarios: [],
    situacoes: [],
    tipos: [],
    projetos: [],
  });
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([]);
  const [mostrarFormSubtarefa, setMostrarFormSubtarefa] = useState(false);
  const [arquivosTemp, setArquivosTemp] = useState<Array<{ uuid: string; nome: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [novaMovimentacao, setNovaMovimentacao] = useState({ situacaoId: '', descricao: '' });
  const [editandoMovimentacao, setEditandoMovimentacao] = useState<Movimentacao | null>(null);

  const { execute: atualizar, isLoading: isSubmitting } = useMutate('/tarefas', 'put');
  const { execute: criarMovimentacao } = useMutate('/tarefas', 'post');
  const { execute: criarSubtarefa, isLoading: isCriandoSubtarefa } = useMutate('/tarefas', 'post');
  const { execute: atualizarMovimentacao } = useMutate('/tarefas', 'put');
  const { execute: removerMovimentacao } = useMutate('/tarefas', 'delete');
  const { execute: removerAnexo } = useMutate('/tarefas', 'delete');
  const { execute: removerTarefa, isLoading: isRemovendoTarefa } = useMutate('/tarefas', 'delete');
  const { execute: confirmarAnexos, isLoading: isConfirmandoAnexos } = useMutate(
    '/tarefas',
    'post'
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const {
    register: registerSubtarefa,
    handleSubmit: handleSubmitSubtarefa,
    control: controlSubtarefa,
    reset: resetSubtarefa,
    formState: { errors: errorsSubtarefa },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const carregarSubtarefas = async () => {
    try {
      const response = await api.get(`/tarefas/${tarefaId}/subtarefas`);
      setSubtarefas(response.data);
    } catch {
      toast.error('Erro ao carregar subtarefas');
    }
  };

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
        projetoId: String(tarefaRes.data.projetoId),
        responsavelId: String(tarefaRes.data.responsavelId),
        situacaoId: String(tarefaRes.data.situacaoId),
        tipoId: String(tarefaRes.data.tipoId),
        inicioPrevisto: tarefaRes.data.inicioPrevisto || '',
        prazo: tarefaRes.data.prazo || '',
      });
      resetSubtarefa({
        titulo: '',
        descricao: '',
        projetoId: String(tarefaRes.data.projetoId),
        responsavelId: String(tarefaRes.data.responsavelId),
        situacaoId: String(tarefaRes.data.situacaoId),
        tipoId: String(tarefaRes.data.tipoId),
        inicioPrevisto: '',
        prazo: '',
      });
      carregarSubtarefas();
    } catch {
      toast.error('Erro ao carregar tarefa');
    } finally {
      setIsLoading(false);
    }
  };

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
    carregarTarefa();
  }, [tarefaId]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const payload: Record<string, unknown> = {
        titulo: data.titulo,
        descricao: data.descricao,
        projetoId: Number(data.projetoId),
        responsavelId: Number(data.responsavelId),
        situacaoId: Number(data.situacaoId),
        tipoId: Number(data.tipoId),
      };
      if (data.inicioPrevisto) {
        payload.inicioPrevisto = data.inicioPrevisto;
      }
      if (data.prazo) {
        payload.prazo = data.prazo;
      }
      await atualizar(payload, `/tarefas/${tarefaId}`);
      toast.success('Tarefa atualizada');
      setIsEditing(false);
      carregarTarefa();
    } catch {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleCancelEdit = () => {
    if (tarefa) {
      reset({
        titulo: tarefa.titulo,
        descricao: tarefa.descricao || '',
        projetoId: String(tarefa.projetoId),
        responsavelId: String(tarefa.responsavelId),
        situacaoId: String(tarefa.situacaoId),
        tipoId: String(tarefa.tipoId),
        inicioPrevisto: tarefa.inicioPrevisto || '',
        prazo: tarefa.prazo || '',
      });
    }
    setIsEditing(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    try {
      const response = await api.post(`/tarefas/${tarefaId}/anexos/upload-temp`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setArquivosTemp([...arquivosTemp, { uuid: response.data.uuid, nome: response.data.nome }]);
      toast.success('Arquivo adicionado à lista de pendentes');
    } catch {
      toast.error('Erro ao anexar arquivo');
    }
  };

  const handleRemoverTemp = (uuid: string) => {
    setArquivosTemp(arquivosTemp.filter((a) => a.uuid !== uuid));
  };

  const handleConfirmarAnexos = async () => {
    if (arquivosTemp.length === 0) {
      toast.error('Nenhum arquivo pendente para confirmar');
      return;
    }
    try {
      const response = await confirmarAnexos<Anexo[]>(
        { uuids: arquivosTemp.map((a) => a.uuid) },
        `/tarefas/${tarefaId}/anexos/confirmar`
      );
      setArquivosTemp([]);
      setAnexos([...response, ...anexos]);
      toast.success('Anexos confirmados');
    } catch {
      toast.error('Erro ao confirmar anexos');
    }
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

  const onSubmitSubtarefa: SubmitHandler<FormData> = async (data) => {
    try {
      const payload: Record<string, unknown> = {
        titulo: data.titulo,
        descricao: data.descricao,
        projetoId: Number(data.projetoId),
        responsavelId: Number(data.responsavelId),
        situacaoId: Number(data.situacaoId),
        tipoId: Number(data.tipoId),
        tarefaPaiId: tarefaId,
      };
      if (data.inicioPrevisto) {
        payload.inicioPrevisto = data.inicioPrevisto;
      }
      if (data.prazo) {
        payload.prazo = data.prazo;
      }
      await criarSubtarefa(payload, '/tarefas');
      resetSubtarefa({
        titulo: '',
        descricao: '',
        projetoId: String(tarefa?.projetoId),
        responsavelId: String(tarefa?.responsavelId),
        situacaoId: String(tarefa?.situacaoId),
        tipoId: String(tarefa?.tipoId),
        inicioPrevisto: '',
        prazo: '',
      });
      setMostrarFormSubtarefa(false);
      carregarSubtarefas();
      toast.success('Subtarefa criada');
    } catch {
      toast.error('Erro ao criar subtarefa');
    }
  };

  const handleRemoverTarefa = async () => {
    const temSubtarefas = subtarefas.length > 0;
    const mensagem = temSubtarefas
      ? 'Atenção: esta tarefa possui subtarefas. A exclusão removerá também todas as subtarefas em cascata. Deseja continuar?'
      : 'Deseja remover esta tarefa?';
    if (!confirm(mensagem)) return;
    try {
      await removerTarefa(undefined, `/tarefas/${tarefaId}`);
      toast.success('Tarefa removida');
      navigate('/tarefas');
    } catch {
      toast.error('Erro ao remover tarefa');
    }
  };

  const handleAdicionarMovimentacao = async () => {
    if (!novaMovimentacao.descricao && !novaMovimentacao.situacaoId) {
      toast.error('Informe uma situação ou uma descrição');
      return;
    }
    try {
      const payload: { situacaoId?: number; descricao: string } = {
        descricao: novaMovimentacao.descricao,
      };
      if (novaMovimentacao.situacaoId) {
        payload.situacaoId = Number(novaMovimentacao.situacaoId);
      }
      await criarMovimentacao(payload, `/tarefas/${tarefaId}/movimentacoes`);
      setNovaMovimentacao({ situacaoId: '', descricao: '' });
      const response = await api.get(`/tarefas/${tarefaId}/movimentacoes`);
      setMovimentacoes(response.data);
      const tarefaResponse = await api.get(`/tarefas/${tarefaId}`);
      setTarefa(tarefaResponse.data);
      if (novaMovimentacao.situacaoId) {
        setValue('situacaoId', novaMovimentacao.situacaoId);
      }
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

  const tabs = [
    { id: 'geral', label: 'Visão Geral', icon: <FileText size={18} /> },
    { id: 'movimentacoes', label: 'Movimentações', icon: <History size={18} /> },
    { id: 'arquivos', label: 'Arquivos', icon: <Files size={18} /> },
    { id: 'subtarefas', label: 'Tarefas relacionadas', icon: <Plus size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/tarefas">
            <Button variant="ghost" size="sm">
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Tarefa #{tarefa?.numero}/{tarefa?.ano}
            </h1>
            {tarefa && (
              <p className="text-sm text-gray-500">
                Criada por {tarefa.criadoPorNome} em{' '}
                {format(new Date(tarefa.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </p>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-danger"
          onClick={handleRemoverTarefa}
          isLoading={isRemovendoTarefa}
        >
          <Trash2 size={18} />
          Remover
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
        <TabPanel isActive={activeTab === 'geral'}>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Card
                title="Dados da tarefa"
                action={
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                }
              >
                <TarefaFormFields
                  register={register}
                  control={control}
                  errors={errors}
                  opcoes={opcoes}
                />
                <div className="mt-6 flex justify-end">
                  <Button type="submit" isLoading={isSubmitting}>
                    <Save size={18} />
                    Salvar alterações
                  </Button>
                </div>
              </Card>
            </form>
          ) : (
            <Card
              title="Dados da tarefa"
              action={
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil size={16} />
                  Editar
                </Button>
              }
            >
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Título</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tarefa?.titulo}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Projeto</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tarefa?.projetoId}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Responsável</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tarefa?.responsavelNome}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Situação</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: CORES_SITUACAO[tarefa?.situacaoCor || 'gray']?.bg || '#6B7280' }}
                    />
                    <span className="text-sm text-gray-900">{tarefa?.situacaoDescricao}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tarefa?.tipoDescricao}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Início Previsto</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {tarefa?.inicioPrevisto
                      ? format(new Date(tarefa.inicioPrevisto), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Prazo</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {tarefa?.prazo
                      ? format(new Date(tarefa.prazo), 'dd/MM/yyyy', { locale: ptBR })
                      : '-'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Criada por</dt>
                  <dd className="mt-1 text-sm text-gray-900">{tarefa?.criadoPorNome}</dd>
                </div>
              </dl>
                  {tarefa?.descricao && (
                          
                <div className="mt-6 border-t-gray-300 border-t pt-6">
                  <dt className="text-sm font-medium text-gray-500">Detalhes</dt>
                  <dd className="mt-2 text-sm text-gray-900 prose" dangerouslySetInnerHTML={{ __html: tarefa.descricao }} />
                </div>
              )}
            </Card>
          )}
        </TabPanel>

        <TabPanel isActive={activeTab === 'arquivos'}>
          <Card title="Gerenciar anexos">
            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer w-fit text-sm text-gray-700">
                  <Paperclip size={18} />
                  Anexar arquivo
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
              </div>

              {arquivosTemp.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Arquivos pendentes</p>
                    <Button
                      size="sm"
                      onClick={handleConfirmarAnexos}
                      isLoading={isConfirmandoAnexos}
                    >
                      <Save size={16} />
                      Confirmar anexos
                    </Button>
                  </div>
                  {arquivosTemp.map((arquivo) => (
                    <div
                      key={arquivo.uuid}
                      className="flex items-center justify-between px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg"
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

              {anexos.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Arquivos Anexados</p>
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
                          <Eye size={16} />
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

              {arquivosTemp.length === 0 && anexos.length === 0 && (
                <p className="text-gray-500 text-center py-8">Nenhum arquivo anexado.</p>
              )}
            </div>
          </Card>
        </TabPanel>

        <TabPanel isActive={activeTab === 'movimentacoes'}>
          <Card title="Histórico de movimentações">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <FormSelect
                  label="Alterar situação (opcional)"
                  options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
                  value={novaMovimentacao.situacaoId}
                  onChange={(e) =>
                    setNovaMovimentacao({ ...novaMovimentacao, situacaoId: e.target.value })
                  }
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Detalhes
                  </label>
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
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma movimentação registrada.
                  </p>
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
                            {movimentacao.situacaoDescricao}
                          </span>
                          <span className="text-sm text-gray-500">
                            por {movimentacao.criadoPorNome}
                          </span>
                        </div>
                        <span className="text-sm text-gray-400">
                          {format(new Date(movimentacao.criadoEm), 'dd/MM/yyyy HH:mm', {
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
        </TabPanel>

        <TabPanel isActive={activeTab === 'subtarefas'}>
          <Card title="Tarefas relacionadas">
            <div className="space-y-6">
              {!mostrarFormSubtarefa && (
                <Button size="sm" onClick={() => setMostrarFormSubtarefa(true)}>
                  <Plus size={18} />
                  Nova subtarefa
                </Button>
              )}

              {mostrarFormSubtarefa && (
                <form onSubmit={handleSubmitSubtarefa(onSubmitSubtarefa)} className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700">Nova subtarefa</h3>
                  <TarefaFormFields
                    register={registerSubtarefa}
                    control={controlSubtarefa}
                    errors={errorsSubtarefa}
                    opcoes={opcoes}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setMostrarFormSubtarefa(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" size="sm" isLoading={isCriandoSubtarefa}>
                      <Save size={16} />
                      Criar subtarefa
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {subtarefas.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhuma subtarefa cadastrada.</p>
                ) : (
                  subtarefas.map((subtarefa) => (
                    <Link
                      key={subtarefa.id}
                      to={`/tarefas/${subtarefa.id}`}
                      className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          #{subtarefa.numero}/{subtarefa.ano} {subtarefa.titulo}
                        </p>
                        <p className="text-xs text-gray-500">
                          Responsável: {subtarefa.responsavelNome}
                        </p>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${CORES_SITUACAO[subtarefa.situacaoCor]?.bg || '#6B7280'}20`,
                          color: CORES_SITUACAO[subtarefa.situacaoCor]?.text || '#374151',
                        }}
                      >
                        {subtarefa.situacaoDescricao}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </Card>
        </TabPanel>
      </Tabs>
    </div>
  );
}
