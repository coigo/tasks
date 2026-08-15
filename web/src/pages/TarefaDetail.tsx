import { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { TarefaFormFields } from '../components/TarefaFormFields';
import { Tabs, TabPanel } from '../components/Tabs';
import { AnexosTemp } from '../components/AnexosTemp';
import { Movimentacoes } from '../components/Movimentacoes';
import { useMutate } from '../hooks/useApi';
import { useTarefaOpcoes } from '../hooks/useTarefaOpcoes';
import { tarefaSchema, type TarefaFormData, buildTarefaPayload } from '../schemas/tarefa';
import {
  ArrowLeft,
  Plus,
  Trash2,
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
import type { Tarefa, Movimentacao, Anexo, Subtarefa } from '../schemas/tarefa';

export function TarefaDetail() {
  const { id } = useParams<{ id: string }>();
  const tarefaId = Number(id);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('geral');

  const [tarefa, setTarefa] = useState<Tarefa | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [subtarefas, setSubtarefas] = useState<Subtarefa[]>([]);
  const [mostrarFormSubtarefa, setMostrarFormSubtarefa] = useState(false);
  const [arquivosTemp, setArquivosTemp] = useState<Array<{ uuid: string; nome: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const opcoes = useTarefaOpcoes();

  const { execute: atualizar, isLoading: isSubmitting } = useMutate('/tarefas', 'put');
  const { execute: criarSubtarefa, isLoading: isCriandoSubtarefa } = useMutate('/tarefas', 'post');
  const { execute: removerAnexo } = useMutate('/tarefas', 'delete');
  const { execute: removerTarefa, isLoading: isRemovendoTarefa } = useMutate('/tarefas', 'delete');
  const { execute: confirmarAnexos, isLoading: isConfirmandoAnexos } = useMutate(
    '/tarefas',
    'post'
  );

  const form = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
  });

  const subtarefaForm = useForm<TarefaFormData>({
    resolver: zodResolver(tarefaSchema),
  });

  const carregarSubtarefas = async () => {
    try {
      const response = await api.get(`/tarefas/${tarefaId}/subtarefas`);
      setSubtarefas(response.data);
    } catch {
      toast.error('Erro ao carregar subtarefas');
    }
  };

  const resetForm = (data: Tarefa) => {
    form.reset({
      titulo: data.titulo,
      descricao: data.descricao || '',
      projetoId: String(data.projetoId),
      responsavelId: String(data.responsavelId),
      situacaoId: String(data.situacaoId),
      tipoId: String(data.tipoId),
      inicioPrevisto: data.inicioPrevisto || '',
      prazo: data.prazo || '',
    });
  };

  const resetSubtarefaForm = (data?: Tarefa) => {
    subtarefaForm.reset({
      titulo: '',
      descricao: '',
      projetoId: String(data?.projetoId ?? tarefa?.projetoId),
      responsavelId: String(data?.responsavelId ?? tarefa?.responsavelId),
      situacaoId: String(data?.situacaoId ?? tarefa?.situacaoId),
      tipoId: String(data?.tipoId ?? tarefa?.tipoId),
      inicioPrevisto: '',
      prazo: '',
    });
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
      resetForm(tarefaRes.data);
      resetSubtarefaForm(tarefaRes.data);
      carregarSubtarefas();
    } catch {
      toast.error('Erro ao carregar tarefa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarTarefa();
  }, [tarefaId]);

  const onSubmit: SubmitHandler<TarefaFormData> = async (data) => {
    try {
      await atualizar(buildTarefaPayload(data), `/tarefas/${tarefaId}`);
      toast.success('Tarefa atualizada');
      setIsEditing(false);
      carregarTarefa();
    } catch {
      toast.error('Erro ao atualizar tarefa');
    }
  };

  const handleCancelEdit = () => {
    if (tarefa) resetForm(tarefa);
    setIsEditing(false);
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

  const onSubmitSubtarefa: SubmitHandler<TarefaFormData> = async (data) => {
    try {
      await criarSubtarefa(
        buildTarefaPayload(data, { tarefaPaiId: tarefaId }),
        '/tarefas'
      );
      resetSubtarefaForm();
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card
                title="Dados da tarefa"
                action={
                  <Button variant="secondary" size="sm" onClick={handleCancelEdit}>
                    Cancelar
                  </Button>
                }
              >
                <TarefaFormFields
                  register={form.register}
                  control={form.control}
                  errors={form.formState.errors}
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
              <AnexosTemp
                uploadUrl={`/tarefas/${tarefaId}/anexos/upload-temp`}
                arquivos={arquivosTemp}
                onChange={setArquivosTemp}
                headerAction={
                  arquivosTemp.length > 0 ? (
                    <Button onClick={handleConfirmarAnexos} isLoading={isConfirmandoAnexos}>
                      <Save size={16} />
                      Confirmar anexos
                    </Button>
                  ) : null
                }
              />

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
                        <Button size="sm" variant="ghost" onClick={() => handleDownloadAnexo(anexo)}>
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
            <Movimentacoes
              tarefaId={tarefaId}
              movimentacoes={movimentacoes}
              opcoes={opcoes}
              onChange={setMovimentacoes}
              onSituacaoChange={(situacaoId) => {
                form.setValue('situacaoId', situacaoId);
                carregarTarefa();
              }}
            />
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
                <form onSubmit={subtarefaForm.handleSubmit(onSubmitSubtarefa)} className="space-y-4 border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-700">Nova subtarefa</h3>
                  <TarefaFormFields
                    register={subtarefaForm.register}
                    control={subtarefaForm.control}
                    errors={subtarefaForm.formState.errors}
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
