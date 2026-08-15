import { Link } from "react-router-dom";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, AlertCircle } from "lucide-react";
import type { TarefaResumida } from "../schemas/tarefa";

interface KanbanCardProps {
   tarefa: TarefaResumida;
}

export function KanbanCard({ tarefa }: KanbanCardProps) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
   } = useSortable({ id: tarefa.id });

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
   };

   const isPastDeadline = tarefa.prazo && new Date(tarefa.prazo) < new Date();

   return (
      <div
         ref={setNodeRef}
         style={style}
         {...attributes}
         {...listeners}
         className="bg-white border border-gray-200 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 hover:shadow-sm transition-all"
      >
         <Link to={`/tarefas/${tarefa.id}`} className="block">
            <div className="font-medium text-gray-900 text-sm mb-1 flex justify-between">
               <span>
                  #{tarefa.numero}/{tarefa.ano} {tarefa.titulo}
               </span>
               {tarefa.prazo && (
                  <span
                     className={`flex items-center gap-1 text-xs ${
                        isPastDeadline ? "text-red-600" : "text-gray-500"
                     }`}
                  >
                     {isPastDeadline ? (
                        <AlertCircle size={12} />
                     ) : (
                        <Calendar size={12} />
                     )}
                     {format(new Date(tarefa.prazo), "dd/MM/yy", {
                        locale: ptBR,
                     })}
                  </span>
               )}
            </div>
            <p className="text-xs text-gray-500 mb-2">
               {tarefa.projetoNome} • {tarefa.tipoDescricao}
            </p>
            <div className="flex items-center justify-between">
               <span className="text-xs text-gray-500">
                  {tarefa.responsavelNome}
               </span>
            </div>
            <div className="mt-2"></div>
         </Link>
      </div>
   );
}
