import { Controller } from 'react-hook-form';
import type { Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { FormInput } from './FormInput';
import { FormSelect } from './FormSelect';
import { RichTextEditor } from './RichTextEditor';
import type { TarefaFormData } from '../schemas/tarefa';
import type { Opcoes } from '../schemas/tarefa';

interface TarefaFormFieldsProps {
  register: UseFormRegister<TarefaFormData>;
  control: Control<TarefaFormData>;
  errors: FieldErrors<TarefaFormData>;
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
          error={errors.projetoId?.message}
          {...register('projetoId')}
        />
        <FormSelect
          label="Responsável"
          options={opcoes.usuarios.map((u) => ({ value: u.id, label: u.nome }))}
          error={errors.responsavelId?.message}
          {...register('responsavelId')}
        />
        <FormSelect
          label="Situação"
          options={opcoes.situacoes.map((s) => ({ value: s.id, label: s.descricao }))}
          error={errors.situacaoId?.message}
          {...register('situacaoId')}
        />
        <FormSelect
          label="Tipo"
          options={opcoes.tipos.map((t) => ({ value: t.id, label: t.descricao }))}
          error={errors.tipoId?.message}
          {...register('tipoId')}
        />
        <FormInput
          label="Início Previsto"
          type="date"
          error={errors.inicioPrevisto?.message}
          {...register('inicioPrevisto')}
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
    </div>
  );
}
