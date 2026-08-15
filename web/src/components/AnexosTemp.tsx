import { Paperclip, Trash2 } from 'lucide-react';
import { Button } from './Button';
import api from '../services/api';
import toast from 'react-hot-toast';
import type { ReactNode } from 'react';

interface AnexoTemp {
  uuid: string;
  nome: string;
}

interface AnexosTempProps {
  uploadUrl: string;
  arquivos: AnexoTemp[];
  onChange: (arquivos: AnexoTemp[]) => void;
  headerAction?: ReactNode;
}

export function AnexosTemp({ uploadUrl, arquivos, onChange, headerAction }: AnexosTempProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    try {
      const response = await api.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange([...arquivos, { uuid: response.data.uuid, nome: response.data.nome }]);
      toast.success('Arquivo adicionado');
    } catch {
      toast.error('Erro ao anexar arquivo');
    }
  };

  const handleRemover = (uuid: string) => {
    onChange(arquivos.filter((a) => a.uuid !== uuid));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer w-fit text-sm text-gray-700">
          <Paperclip size={18} />
          Anexar arquivo
          <input type="file" className="hidden" onChange={handleUpload} />
        </label>
      </div>

      {arquivos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Arquivos pendentes</p>
            {headerAction}
          </div>
          {arquivos.map((arquivo) => (
            <div
              key={arquivo.uuid}
              className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
            >
              <span className="text-sm text-gray-700">{arquivo.nome}</span>
              <Button
                size="sm"
                variant="ghost"
                className="text-danger"
                onClick={() => handleRemover(arquivo.uuid)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
