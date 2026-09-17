import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';

interface MarkdownEditorProps {
  value?: string;
  onChange?: (markdown: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  value = '',
  onChange,
  placeholder = 'Digite algo ou use / para comandos',
}: MarkdownEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
      }),
      Markdown,
    ],
    content: value,
    editorProps: {
      attributes: {
        spellcheck: 'false',
      },
    },
    onBlur: ({ editor }) => {
      const markdown = editor.getMarkdown();
      onChange?.(markdown);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-18rem)]">
      <div className="border bg-transparent border-none transition-colors flex-1 overflow-hidden">
        <div className="p-6 h-full overflow-y-auto">
          <EditorContent
            editor={editor}
            className="outline-none [&_*]:outline-none [&>div]:min-h-[250px]"
            spellCheck={false}
          />
        </div>
      </div>
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
          color: #6b7280;
          text-decoration:none;
        }
        .ProseMirror:focus {
          outline: none;
        }
        .ProseMirrorGrammarRuler-wrapper {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
}
