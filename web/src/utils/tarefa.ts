import type { TarefaResumida } from '../schemas/tarefa';

interface TarefaApi {
  id: number;
  numero: number;
  ano: number;
  titulo: string;
  situacaoId: number;
  situacaoDescricao: string;
  situacaoCor?: string;
  situacaoEncerraTarefa?: boolean;
  tipoDescricao: string;
  responsavelNome: string;
  projetoNome: string;
  prazo?: string | null;
  tarefaPaiId?: number | null;
}

export function mapTarefaToResumida(t: TarefaApi): TarefaResumida {
  return {
    id: t.id,
    numero: t.numero,
    ano: t.ano,
    titulo: t.titulo,
    situacaoId: t.situacaoId,
    situacaoDescricao: t.situacaoDescricao,
    situacaoCor: t.situacaoCor || 'gray',
    situacaoEncerraTarefa: t.situacaoEncerraTarefa,
    tipoDescricao: t.tipoDescricao,
    responsavelNome: t.responsavelNome,
    projetoNome: t.projetoNome,
    prazo: t.prazo ?? null,
    tarefaPaiId: t.tarefaPaiId ?? null,
  };
}
