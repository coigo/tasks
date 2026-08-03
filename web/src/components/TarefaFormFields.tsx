import { Controller } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { RichTextEditor } from './RichTextEditor';

interface Opcoes {
  usuarios: Array<{ id: number; nome: string }>;
  situacoes: Array<{ id: number; descricao: string; encerra_tarefa: boolean }>;
  tipos: Array<{ id: number; descricao: string }>;
  projetos: Array<{ id: number; nome: string }>;
}

interface TarefaFormFieldsProps {
  register: UseFormRegister<{
    titulo: string;
    descricao: string;
    projeto_id: string;
    responsavel_id: string;
    situacao_id: string;
    tipo_id: string;
  }>;
  control: Control<{
    titulo: string;
    descricao: string;
    projeto_id: string;
    responsavel_id: string;
    situacao_id: string;
    tipo_id: string;
  }>;
  errors: FieldErrors<{
    titulo: string;
    descricao: string;
    projeto_id: string;
    responsavel_id: string;
    situacao_id: string;
    tipo_id: string;
  }>;
  opcoes: Opcoes;
}

export function TarefaFormFields({ register, control, errors, opcoes }: TarefaFormFieldsProps) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Título"
        placeholder="Título da tarefa"
        error={errors.titulo?.message}
        {...register('titulo')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}
