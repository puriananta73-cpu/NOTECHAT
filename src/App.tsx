import React, { useState, useEffect } from 'react';
import { Note } from './types';
import {
  getStoredNotes,
  saveStoredNotes,
  getStoredPin,
  setStoredPin,
} from './services/storage';
import { NotesDashboard } from './components/notes/NotesDashboard';
import { ChatContainer } from './components/chat/ChatContainer';

export default function App() {
  const [mode, setMode] = useState<'notes' | 'chat'>('notes');
  const [notes, setNotes] = useState<Note[]>(() => getStoredNotes());
  const [pin, setPin] = useState<string | null>(() => getStoredPin());
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Tab Title sync
  useEffect(() => {
    if (mode === 'notes') {
      document.title = 'QuickNote - Clean & Fast Personal Notes';
    } else {
      document.title = 'QuickNote - Global Notes Sync';
    }
  }, [mode]);

  // Notes persistence
  const handleSaveNote = (updatedNote: Note) => {
    // Safety check: Never save notes titled #APAP
    if (updatedNote.title.trim() === '#APAP') {
      triggerSecretChat();
      return;
    }

    setNotes((prev) => {
      const index = prev.findIndex((n) => n.id === updatedNote.id);
      let nextNotes: Note[];
      if (index >= 0) {
        nextNotes = [...prev];
        nextNotes[index] = updatedNote;
      } else {
        nextNotes = [updatedNote, ...prev];
      }
      saveStoredNotes(nextNotes);
      return nextNotes;
    });
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => {
      const filtered = prev.filter((n) => n.id !== id);
      saveStoredNotes(filtered);
      return filtered;
    });
  };

  const handleSetPin = (newPin: string | null) => {
    setPin(newPin);
    setStoredPin(newPin);
  };

  const triggerSecretChat = () => {
    // Purge any note that might contain #APAP
    setNotes((prev) => {
      const purged = prev.filter((n) => n.title.trim() !== '#APAP');
      saveStoredNotes(purged);
      return purged;
    });

    setIsTransitioning(true);
    setTimeout(() => {
      setMode('chat');
      setIsTransitioning(false);
    }, 250);
  };

  const triggerPanicToNotes = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setMode('notes');
      setIsTransitioning(false);
    }, 150);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#fafaf9]">
      {/* Smooth transition veil */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-black/80 transition-opacity duration-200 pointer-events-none" />
      )}

      {mode === 'notes' ? (
        <NotesDashboard
          notes={notes}
          onSaveNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
          onTriggerSecret={triggerSecretChat}
          pin={pin}
          onSetPin={handleSetPin}
        />
      ) : (
        <ChatContainer onPanic={triggerPanicToNotes} />
      )}
    </div>
  );
}
