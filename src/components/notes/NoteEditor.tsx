import React, { useState, useEffect, useRef } from 'react';
import { Note } from '../../types';
import {
  ArrowLeft,
  Pin,
  Trash2,
  CheckSquare,
  List,
  Heading,
  Bold,
  Italic,
  Share2,
  Calendar,
  Check,
} from 'lucide-react';

interface NoteEditorProps {
  note: Note | null;
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onTriggerSecret: () => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  onSave,
  onDelete,
  onClose,
  onTriggerSecret,
}) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [category, setCategory] = useState(note?.category || 'Personal');
  const [pinned, setPinned] = useState(note?.pinned || false);
  const [color, setColor] = useState(note?.color || '#ffffff');
  const [lastSaved, setLastSaved] = useState<string>('Saved just now');
  const [copied, setCopied] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTriggeredRef = useRef(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setCategory(note.category);
      setPinned(note.pinned);
      setColor(note.color || '#ffffff');
    } else {
      setTitle('');
      setContent('');
      setCategory('Personal');
      setPinned(false);
      setColor('#ffffff');
      // Focus title for fresh note
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
    isTriggeredRef.current = false;
  }, [note]);

  // Secret trigger detector for #APAP
  const checkSecretTrigger = (val: string): boolean => {
    if (val.trim() === '#APAP') {
      if (!isTriggeredRef.current) {
        isTriggeredRef.current = true;
        // Do not save this note!
        onTriggerSecret();
      }
      return true;
    }
    return false;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (checkSecretTrigger(val)) {
      return;
    }
    autoSave(val, content, category, pinned, color);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    autoSave(title, val, category, pinned, color);
  };

  const autoSave = (
    t: string,
    c: string,
    cat: string,
    pin: boolean,
    col: string
  ) => {
    if (isTriggeredRef.current || t.trim() === '#APAP') return;

    // Only save if there's either title or content
    if (!t.trim() && !c.trim()) return;

    const updatedNote: Note = {
      id: note?.id || `note_${Date.now()}`,
      title: t.trim() || 'Untitled Note',
      content: c,
      category: cat,
      pinned: pin,
      updatedAt: Date.now(),
      createdAt: note?.createdAt || Date.now(),
      color: col,
    };

    onSave(updatedNote);
    setLastSaved('Saved');
  };

  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = prefix + (selectedText || 'item') + suffix;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    autoSave(title, newContent, category, pinned, color);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selectedText ? selectedText.length : 4)
      );
    }, 10);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div
      className="flex flex-col h-full rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden transition-colors"
      style={{ backgroundColor: color === '#ffffff' ? '#ffffff' : color }}
    >
      {/* Top action bar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-200/60 bg-white/60 backdrop-blur-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 px-2.5 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            title="Return to notes list"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Notes</span>
          </button>

          <span className="text-stone-300">|</span>

          <select
            value={category}
            onChange={(e) => {
              const newCat = e.target.value;
              setCategory(newCat);
              autoSave(title, content, newCat, pinned, color);
            }}
            className="text-xs font-medium bg-stone-100/80 text-stone-700 hover:bg-stone-200/70 rounded-md px-2.5 py-1 border-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
          >
            <option value="Personal">Personal</option>
            <option value="Work">Work</option>
            <option value="Ideas">Ideas</option>
            <option value="Reading">Reading</option>
            <option value="Home">Home</option>
            <option value="Drafts">Drafts</option>
          </select>

          <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">
            {lastSaved}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Note color picker pills */}
          <div className="hidden md:flex items-center gap-1 mr-2 px-1 py-0.5 bg-stone-100/70 rounded-full border border-stone-200/50">
            {['#ffffff', '#fef3c7', '#e0f2fe', '#f3e8ff', '#dcfce7'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  autoSave(title, content, category, pinned, c);
                }}
                className={`w-4 h-4 rounded-full border transition-transform ${
                  color === c ? 'scale-125 border-stone-600 shadow-2xs' : 'border-stone-300 hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                title="Change note tint"
              />
            ))}
          </div>

          <button
            onClick={() => {
              const newPinned = !pinned;
              setPinned(newPinned);
              autoSave(title, content, category, newPinned, color);
            }}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              pinned
                ? 'bg-amber-100 text-amber-800'
                : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
            }`}
            title={pinned ? 'Unpin note' : 'Pin note to top'}
          >
            <Pin className={`w-4 h-4 ${pinned ? 'fill-amber-600' : ''}`} />
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`${title}\n\n${content}`);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            title="Copy note text"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {note && (
            <button
              onClick={() => onDelete(note.id)}
              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Formatting quick toolbar */}
      <div className="flex items-center gap-1 px-6 py-2 border-b border-stone-200/40 bg-stone-50/50 text-stone-600">
        <button
          onClick={() => handleInsertFormat('**', '**')}
          className="p-1 hover:bg-stone-200/60 rounded text-stone-600 hover:text-stone-900"
          title="Bold"
        >
          <Bold className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleInsertFormat('*', '*')}
          className="p-1 hover:bg-stone-200/60 rounded text-stone-600 hover:text-stone-900"
          title="Italic"
        >
          <Italic className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleInsertFormat('### ')}
          className="p-1 hover:bg-stone-200/60 rounded text-stone-600 hover:text-stone-900"
          title="Header"
        >
          <Heading className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleInsertFormat('• ')}
          className="p-1 hover:bg-stone-200/60 rounded text-stone-600 hover:text-stone-900"
          title="Bullet List"
        >
          <List className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => handleInsertFormat('[ ] ')}
          className="p-1 hover:bg-stone-200/60 rounded text-stone-600 hover:text-stone-900"
          title="Checklist item"
        >
          <CheckSquare className="w-3.5 h-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-3 text-[11px] text-stone-400 font-mono">
          <span>{wordCount} words</span>
          <span>{charCount} chars</span>
        </div>
      </div>

      {/* Title & Body */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <input
          ref={titleInputRef}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="text-2xl font-semibold tracking-tight text-stone-900 placeholder-stone-300 border-none bg-transparent focus:outline-none focus:ring-0 mb-4 px-0"
        />

        <div className="flex items-center gap-2 text-xs text-stone-400 mb-4 pb-2 border-b border-stone-100">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {new Date(note?.updatedAt || Date.now()).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          placeholder="Start typing your note, ideas, checklists, or scratchpad thoughts..."
          className="flex-1 w-full text-sm leading-relaxed text-stone-700 placeholder-stone-300 border-none bg-transparent resize-none focus:outline-none focus:ring-0 font-sans"
        />
      </div>
    </div>
  );
};
