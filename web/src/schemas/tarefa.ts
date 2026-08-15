import { z } from 'zod';

export interface TarefaResumida {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoId: number;
  situacaoDescricao: string;
  situacaoCor: string;
  situacaoEncerraTarefa?: boolean;
  tipoDescricao: string;
  responsavelNome: string;
  projetoNome: string;
  prazo: string | null;
  tarefaPaiId: number | null;
  ultimaMovEm?: string;
}

export interface Opcoes {
  usuarios: Array<{ id: number; nome: string }>;
  situacoes: Array<{ id: number; descricao: string; encerraTarefa: boolean; cor?: string }>;
  tipos: Array<{ id: number; descricao: string }>;
  projetos: Array<{ id: number; nome: string }>;
}

export interface Movimentacao {
  id: number;
  situacaoId: number;
  situacaoDescricao: string;
  descricao: string;
  criadoPorNome: string;
  criadoEm: string;
}

export interface Anexo {
  id: number;
  uuid: string;
  nome: string;
  local: string;
  tamanho: number;
  criadoEm: string;
}

export interface Subtarefa {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoDescricao: string;
  situacaoCor: string;
  responsavelNome: string;
}

export interface Tarefa {
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

export const tarefaSchema = z.object({
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

export type TarefaFormData = z.infer<typeof tarefaSchema>;

export interface TarefaPayload {
  titulo: string;
  descricao: string;
  projetoId: number;
  responsavelId: number;
  situacaoId: number;
  tipoId: number;
  inicioPrevisto?: string;
  prazo?: string;
  tarefaPaiId?: number;
  anexos?: string[];
}

export function buildTarefaPayload(
  data: TarefaFormData,
  extras?: Partial<TarefaPayload>
): TarefaPayload {
  const payload: TarefaPayload = {
    titulo: data.titulo,
    descricao: data.descricao,
    projetoId: Number(data.projetoId),
    responsavelId: Number(data.responsavelId),
    situacaoId: Number(data.situacaoId),
    tipoId: Number(data.tipoId),
  };
  if (data.inicioPrevisto) payload.inicioPrevisto = data.inicioPrevisto;
  if (data.prazo) payload.prazo = data.prazo;
  return { ...payload, ...extras };
}
