import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import api from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';
import { useEffect, useState, useRef } from 'react';

interface MarkdownEditorProps {
  projetoId: number;
  initialValue?: string;
  placeholder?: string;
}

export function MarkdownEditor({
  projetoId,
  initialValue = '',
  placeholder = 'Digite algo ou use / para comandos',
}: MarkdownEditorProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedRef = useRef(initialValue);
  const debouncedValue = useDebounce(value, 500);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      Markdown,
    ],
    content: initialValue,
    contentType: 'markdown',
    onBlur: ({ editor }) => {
      const markdown = editor.getMarkdown();
      setValue(markdown);
    },
  });

  useEffect(() => {
    if (debouncedValue === lastSavedRef.current) return;

    const salvar = async () => {
      setIsSaving(true);
      try {
        await api.patch(`/projetos/${projetoId}/detalhes`, {
          detalhes: debouncedValue,
        });
        lastSavedRef.current = debouncedValue;
      } catch {
        toast.error('Erro ao salvar descrição');
      } finally {
        setIsSaving(false);
      }
    };

    salvar();
  }, [debouncedValue, projetoId]);

  if (!editor) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="border border-gray-200 rounded-lg bg-gray-50 transition-colors">
        <div className="p-6 min-h-[300px]">
          <EditorContent
            editor={editor}
            className="outline-none [&_*]:outline-none [&>div]:min-h-[250px]"
          />
        </div>
      </div>
      {isSaving && (
        <p className="text-xs text-gray-400 mt-1 text-right">Salvando...</p>
      )}
      <style>{`
        .ProseMirror p.is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror p {
          margin: 0;
          line-height: 1.6;
          min-height: 1.6em;
        }
        .ProseMirror p + p {
          margin-top: 0.5em;
        }
        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3 {
          margin-top: 0.75em;
          margin-bottom: 0.25em;
          font-weight: 600;
        }
        .ProseMirror h1 {
          font-size: 1.5rem;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
        }
        .ProseMirror h3 {
          font-size: 1.125rem;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.25em;
          margin: 0.5em 0;
        }
        .ProseMirror li + li {
          margin-top: 0.25em;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 1em;
          margin: 0.5em 0;
          color: #4b5563;
        }
        .ProseMirror:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
}
