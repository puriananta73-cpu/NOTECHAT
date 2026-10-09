import React, { useState, useMemo, useEffect } from 'react';
import { Note } from '../../types';
import { NoteEditor } from './NoteEditor';
import { PinLockModal } from './PinLockModal';
import {
  Search,
  Plus,
  Pin,
  FileText,
  Briefcase,
  User,
  BookOpen,
  Home,
  Archive,
  Lock,
  Unlock,
  SlidersHorizontal,
  Download,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface NotesDashboardProps {
  notes: Note[];
  onSaveNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onTriggerSecret: () => void;
  pin: string | null;
  onSetPin: (newPin: string | null) => void;
}

export const NotesDashboard: React.FC<NotesDashboardProps> = ({
  notes,
  onSaveNote,
  onDeleteNote,
  onTriggerSecret,
  pin,
  onSetPin,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    notes[0]?.id || null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showPinModal, setShowPinModal] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  // Global hotkey: Ctrl+Shift+A / Cmd+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        onTriggerSecret();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTriggerSecret]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes
      .filter((note) => {
        const matchesCategory =
          activeCategory === 'all'
            ? true
            : activeCategory === 'pinned'
            ? note.pinned
            : note.category.toLowerCase() === activeCategory.toLowerCase();

        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
  }, [notes, activeCategory, searchQuery]);

  const selectedNote = useMemo(() => {
    if (isCreatingNew) return null;
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId, isCreatingNew]);

  const handleStartCreateNote = () => {
    setIsCreatingNew(true);
    setSelectedNoteId(null);
  };

  const handleSaveAndSelect = (note: Note) => {
    onSaveNote(note);
    setIsCreatingNew(false);
    setSelectedNoteId(note.id);
  };

  const handleDeleteAndSelect = (id: string) => {
    onDeleteNote(id);
    if (selectedNoteId === id) {
      const remaining = notes.filter((n) => n.id !== id);
      setSelectedNoteId(remaining[0]?.id || null);
      setIsCreatingNew(false);
    }
  };

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockInput === pin) {
      setIsLocked(false);
      setUnlockInput('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
      setUnlockInput('');
    }
  };

  // If locked with PIN
  if (isLocked && pin) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f5f5f4] p-4">
        <div className="bg-white rounded-3xl shadow-lg border border-stone-200/80 max-w-sm w-full p-8 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-semibold text-stone-900 mb-1">QuickNote Locked</h2>
          <p className="text-xs text-stone-500 mb-6">Enter your 4-digit PIN to access your notebook</p>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <input
              type="password"
              maxLength={4}
              value={unlockInput}
              onChange={(e) => {
                setUnlockInput(e.target.value.replace(/\D/g, ''));
                setUnlockError(false);
              }}
              placeholder="••••"
              autoFocus
              className={`w-full py-3 text-center text-2xl font-mono tracking-widest bg-stone-50 border rounded-2xl focus:bg-white focus:outline-none transition-all ${
                unlockError
                  ? 'border-rose-400 text-rose-600 focus:ring-2 focus:ring-rose-200'
                  : 'border-stone-200 text-stone-800 focus:ring-2 focus:ring-amber-500'
              }`}
            />
            {unlockError && (
              <p className="text-xs text-rose-500 font-medium">Incorrect PIN code. Try again.</p>
            )}
            <button
              type="submit"
              className="w-full py-3 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-2xl transition-colors shadow-xs"
            >
              Unlock Notes
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#fafaf9] overflow-hidden select-none font-sans text-stone-800">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-r border-stone-200/80 bg-[#f7f7f5] flex flex-col shrink-0">
        {/* Brand header */}
        <div className="p-4 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-stone-900">QuickNote</h1>
              <p className="text-[10px] text-stone-400 font-medium">Personal Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {pin ? (
              <button
                onClick={() => setIsLocked(true)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
                title="Lock QuickNote"
              >
                <Lock className="w-4 h-4 text-amber-600" />
              </button>
            ) : null}
            <button
              onClick={() => setShowPinModal(true)}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200/50"
              title="Passcode Settings"
            >
              {pin ? <Unlock className="w-4 h-4" /> : <SlidersHorizontal className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Quick Search */}
        <div className="p-3 border-b border-stone-200/60">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-xl placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Categories / Navigation */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
            Folders
          </div>
          <button
            onClick={() => setActiveCategory('all')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeCategory === 'all'
                ? 'bg-amber-100/70 text-amber-900'
                : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>All Notes</span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">{notes.length}</span>
          </button>

          <button
            onClick={() => setActiveCategory('pinned')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeCategory === 'pinned'
                ? 'bg-amber-100/70 text-amber-900'
                : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Pin className="w-4 h-4 text-amber-600" />
              <span>Pinned</span>
            </div>
            <span className="text-[10px] text-stone-400 font-mono">
              {notes.filter((n) => n.pinned).length}
            </span>
          </button>

          <div className="pt-2 px-3 py-1 text-[10px] font-semibold tracking-wider text-stone-400 uppercase">
            Tags
          </div>
          {[
            { id: 'work', label: 'Work', icon: Briefcase, color: 'text-blue-500' },
            { id: 'personal', label: 'Personal', icon: User, color: 'text-emerald-500' },
            { id: 'reading', label: 'Reading', icon: BookOpen, color: 'text-purple-500' },
            { id: 'home', label: 'Home', icon: Home, color: 'text-amber-500' },
          ].map((cat) => {
            const count = notes.filter(
              (n) => n.category.toLowerCase() === cat.id
            ).length;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-amber-100/70 text-amber-900'
                    : 'text-stone-600 hover:bg-stone-200/50 hover:text-stone-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${cat.color}`} />
                  <span>{cat.label}</span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Storage status & offline sync footer */}
        <div className="p-3 border-t border-stone-200/60 bg-stone-100/50 text-[11px] text-stone-500 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Local Sync Active</span>
          </div>
          <span className="text-[10px] text-stone-400 font-mono">v1.4.2</span>
        </div>
      </aside>

      {/* Middle Notes List Pane */}
      <section className="w-full md:w-80 lg:w-96 border-r border-stone-200/80 bg-white flex flex-col shrink-0">
        {/* Action Header */}
        <div className="p-4 border-b border-stone-200/60 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-stone-900 capitalize">
              {activeCategory === 'all'
                ? 'All Notes'
                : activeCategory === 'pinned'
                ? 'Pinned Notes'
                : `${activeCategory} Notes`}
            </h2>
            <p className="text-[11px] text-stone-400">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <button
            onClick={handleStartCreateNote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Note</span>
          </button>
        </div>

        {/* Notes Items List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100 p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-10 h-10 text-stone-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-stone-500">No notes found</p>
              <p className="text-[11px] text-stone-400 mt-1">
                Create a new note to start capturing your thoughts
              </p>
              <button
                onClick={handleStartCreateNote}
                className="mt-3 px-3 py-1.5 text-xs text-amber-600 hover:text-amber-700 bg-amber-50 rounded-lg font-medium"
              >
                + Create note
              </button>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isSelected = !isCreatingNew && selectedNoteId === note.id;
              const dateStr = new Date(note.updatedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setIsCreatingNew(false);
                    setSelectedNoteId(note.id);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-200/90 shadow-2xs'
                      : 'border-transparent hover:bg-stone-50 hover:border-stone-200/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-amber-950' : 'text-stone-800'
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {note.pinned && (
                        <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                      <span className="text-[10px] text-stone-400 font-mono">
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {note.content || 'No additional text'}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                      {note.category}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right Note Editor View */}
      <main className="flex-1 bg-[#fafaf9] p-3 md:p-6 flex flex-col overflow-hidden">
        {isCreatingNew || selectedNote ? (
          <NoteEditor
            key={isCreatingNew ? 'new-note' : selectedNote?.id}
            note={selectedNote}
            onSave={handleSaveAndSelect}
            onDelete={handleDeleteAndSelect}
            onClose={() => {
              setIsCreatingNew(false);
              if (!selectedNoteId && notes.length > 0) {
                setSelectedNoteId(notes[0].id);
              }
            }}
            onTriggerSecret={onTriggerSecret}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-stone-400">
            <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-300 mb-3 shadow-2xs">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-sm font-semibold text-stone-700">Select or create a note</h3>
            <p className="text-xs text-stone-400 max-w-xs mt-1">
              Choose a note from the list on the left, or create a brand new note to organize ideas.
            </p>
            <button
              onClick={handleStartCreateNote}
              className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </button>
          </div>
        )}
      </main>

      {/* PIN Code Configuration Modal */}
      {showPinModal && (
        <PinLockModal
          currentPin={pin}
          onSetPin={onSetPin}
          onClose={() => setShowPinModal(false)}
        />
      )}
    </div>
  );
};
