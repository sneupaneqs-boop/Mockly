import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'

const MenuBtn = ({ active, onClick, title, children, disabled }) => (
  <button
    onMouseDown={e => { e.preventDefault(); onClick?.() }}
    title={title}
    disabled={disabled}
    style={{
      padding: '2px 6px',
      height: 24,
      minWidth: 24,
      border: '1px solid',
      borderColor: active ? '#0f4c81' : '#ccc',
      background: active ? '#e8f0fa' : '#f8f8f8',
      cursor: disabled ? 'default' : 'pointer',
      fontSize: 12,
      borderRadius: 2,
      opacity: disabled ? 0.4 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </button>
)

const Divider = () => <div style={{ width: 1, height: 18, background: '#d0d0d0', margin: '0 3px' }} />

export default function WordProcessor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
    editorProps: {
      attributes: {
        style: 'outline: none; min-height: 100%; font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; padding: 16px 20px;',
      },
    },
  })

  if (!editor) return null

  const wordCount = editor.getText().trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="flex flex-col h-full border border-gray-300" style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* Toolbar */}
      <div style={{ background: '#f3f3f3', borderBottom: '1px solid #d0d0d0', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap', flexShrink: 0 }}>
        {/* Font size */}
        <select
          style={{ height: 24, border: '1px solid #ccc', fontSize: 12, padding: '0 4px' }}
          onChange={e => editor.chain().focus().setMark('textStyle', { fontSize: e.target.value + 'px' }).run()}
        >
          {[10,11,12,14,16,18,20,24,28,36].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Divider />
        <MenuBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)"><b>B</b></MenuBtn>
        <MenuBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)"><i>I</i></MenuBtn>
        <MenuBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)"><u>U</u></MenuBtn>
        <MenuBtn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></MenuBtn>
        <Divider />
        <MenuBtn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Align Left">⬛</MenuBtn>
        <MenuBtn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Center">≡</MenuBtn>
        <MenuBtn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Align Right">▤</MenuBtn>
        <MenuBtn active={editor.isActive({ textAlign: 'justify' })} onClick={() => editor.chain().focus().setTextAlign('justify').run()} title="Justify">▥</MenuBtn>
        <Divider />
        <MenuBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">•≡</MenuBtn>
        <MenuBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered List">1≡</MenuBtn>
        <Divider />
        <MenuBtn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</MenuBtn>
        <MenuBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</MenuBtn>
        <Divider />
        <MenuBtn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert Table">⊞</MenuBtn>
        <MenuBtn
          onClick={() => editor.chain().focus().addColumnAfter().run()}
          disabled={!editor.can().addColumnAfter()}
          title="Add Column"
        >+C</MenuBtn>
        <MenuBtn
          onClick={() => editor.chain().focus().addRowAfter().run()}
          disabled={!editor.can().addRowAfter()}
          title="Add Row"
        >+R</MenuBtn>
        <MenuBtn
          onClick={() => editor.chain().focus().deleteTable().run()}
          disabled={!editor.can().deleteTable()}
          title="Delete Table"
        >✕T</MenuBtn>
        <Divider />
        <label title="Text Color" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 12 }}>
          <span style={{ fontWeight: 'bold' }}>A</span>
          <input type="color" style={{ width: 16, height: 16, border: 'none', padding: 0, cursor: 'pointer' }}
            onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
        </label>
        <label title="Highlight" style={{ display: 'inline-flex', alignItems: 'center', gap: 2, cursor: 'pointer', fontSize: 12 }}>
          <span>🖊</span>
          <input type="color" style={{ width: 16, height: 16, border: 'none', padding: 0, cursor: 'pointer' }}
            onChange={e => editor.chain().focus().toggleHighlight({ color: e.target.value }).run()} />
        </label>
        <Divider />
        <MenuBtn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo">↩</MenuBtn>
        <MenuBtn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo">↪</MenuBtn>
      </div>

      {/* Ruler */}
      <div style={{ height: 20, background: '#f8f8f8', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', padding: '0 20px', flexShrink: 0 }}>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', fontSize: 9, color: '#999', borderLeft: i > 0 ? '1px solid #ddd' : 'none', paddingLeft: 2 }}>{i * 1}</div>
        ))}
      </div>

      {/* Editor area */}
      <div style={{ flex: 1, overflow: 'auto', background: '#fff' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', minHeight: '100%', boxShadow: '0 0 8px rgba(0,0,0,0.08)' }}>
          <EditorContent editor={editor} style={{ minHeight: '400px' }} />
        </div>
      </div>

      {/* Status bar */}
      <div style={{ height: 22, background: '#f0f0f0', borderTop: '1px solid #d0d0d0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 12px', fontSize: 11, color: '#666', flexShrink: 0, gap: 16 }}>
        <span>Words: {wordCount}</span>
        <span>Characters: {editor.getText().length}</span>
      </div>

      <style>{`
        .ProseMirror p { margin: 0.4em 0; }
        .ProseMirror h1 { font-size: 1.6em; font-weight: bold; margin: 0.6em 0 0.3em; }
        .ProseMirror h2 { font-size: 1.3em; font-weight: bold; margin: 0.5em 0 0.2em; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5em; }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 8px 0; }
        .ProseMirror table td, .ProseMirror table th { border: 1px solid #ccc; padding: 4px 8px; min-width: 40px; }
        .ProseMirror table th { background: #f0f0f0; font-weight: bold; }
        .ProseMirror .selectedCell { background: #c7dcf8 !important; }
        .ProseMirror mark { border-radius: 2px; }
      `}</style>
    </div>
  )
}
