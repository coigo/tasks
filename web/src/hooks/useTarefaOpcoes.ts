import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Opcoes } from '../schemas/tarefa';

export function useTarefaOpcoes(): Opcoes {
  const [opcoes, setOpcoes] = useState<Opcoes>({
    usuarios: [],
    situacoes: [],
    tipos: [],
    projetos: [],
  });

  useEffect(() => {
    const carregar = async () => {
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
    carregar();
  }, []);

  return opcoes;
}
