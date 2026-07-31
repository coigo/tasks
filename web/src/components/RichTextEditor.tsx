import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Digite aqui...',
  label,
  error,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active,
    icon: Icon,
  }: {
    onClick: () => void;
    active: boolean;
    icon: React.ElementType;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div
        className={`border rounded-lg overflow-hidden ${
          error ? 'border-danger' : 'border-gray-300'
        }`}
      >
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 bg-gray-50">
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            icon={Bold}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            icon={Italic}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')}
            icon={UnderlineIcon}
          />
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            icon={List}
          />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            icon={ListOrdered}
          />
        </div>
        <EditorContent editor={editor} className="bg-white" />
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
