import { History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { HistoricoAlteracao } from '../schemas/tarefa';

interface HistoricoAlteracoesProps {
  historico: HistoricoAlteracao[];
}

function renderHistoricoItem(item: HistoricoAlteracao): string {
  switch (item.campo) {
    case 'situacao':
      return `Situação alterada de "${item.valorAnterior}" para "${item.valorNovo}"`;
    case 'responsavel':
      return `Responsável alterado de "${item.valorAnterior}" para "${item.valorNovo}"`;
    case 'descricao':
      return `Descrição atualizada`;
    default:
      return `Campo "${item.campo}" alterado`;
  }
}

export function HistoricoAlteracoes({ historico }: HistoricoAlteracoesProps) {
  return (
    <div className="space-y-3">
      {historico.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhuma alteração registrada.</p>
      ) : (
        historico.map((item) => (
          <div key={item.id} className="border border-gray-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History size={16} className="text-primary" />
                <span className="font-medium text-gray-900">{renderHistoricoItem(item)}</span>
              </div>
              <span className="text-sm text-gray-400">
                {format(new Date(item.criadoEm), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
            </div>
            <div className="text-sm text-gray-500">por {item.criadoPorNome}</div>
          </div>
        ))
      )}
    </div>
  );
}
