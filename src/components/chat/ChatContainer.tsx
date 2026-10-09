import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  Settings,
  Users,
  Trash2,
  ArrowDown,
  Sparkles,
  Lock,
  Download,
  EyeOff,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ChatMessage,
  UserProfile,
  MessageType,
  BaaSConfig,
} from '../../types';
import {
  getStoredMessages,
  saveStoredMessages,
  getOrCreateUserProfile,
  saveUserProfile,
  getBaaSConfig,
  saveBaaSConfig,
} from '../../services/storage';
import { realtimeHub } from '../../services/realtime';
import { MessageItem } from './MessageItem';
import { ChatInput } from './ChatInput';
import { VoiceCallOverlay } from './VoiceCallOverlay';
import { DoodleModal } from './DoodleModal';
import { GifPickerModal } from './GifPickerModal';
import { BaaSConfigModal } from './BaaSConfigModal';

interface ChatContainerProps {
  onPanic: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ onPanic }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() =>
    getOrCreateUserProfile()
  );
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    getStoredMessages()
  );
  const [baasConfig, setBaasConfig] = useState<BaaSConfig>(() =>
    getBaaSConfig()
  );

  const [onlineCount, setOnlineCount] = useState<number>(3);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [showDoodleModal, setShowDoodleModal] = useState(false);
  const [showGifModal, setShowGifModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Panic button listener on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onPanic();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPanic]);

  // Connect to realtime hub
  useEffect(() => {
    realtimeHub.initUser(currentUser);
    setOnlineCount(realtimeHub.getOnlineCount());

    const unsub = realtimeHub.subscribe((evt) => {
      if (evt.type === 'chat_message') {
        setMessages((prev) => {
          if (prev.some((m) => m.id === evt.message.id)) return prev;
          const updated = [...prev, evt.message];
          saveStoredMessages(updated);
          return updated;
        });
      } else if (evt.type === 'reaction') {
        setMessages((prev) => {
          const updated = prev.map((m) => {
            if (m.id !== evt.messageId) return m;
            const existingReactions = { ...(m.reactions || {}) };
            const users = existingReactions[evt.emoji] || [];
            if (users.includes(evt.userAlias)) {
              existingReactions[evt.emoji] = users.filter((u) => u !== evt.userAlias);
            } else {
              existingReactions[evt.emoji] = [...users, evt.userAlias];
            }
            return { ...m, reactions: existingReactions };
          });
          saveStoredMessages(updated);
          return updated;
        });
      } else if (evt.type === 'delete_message') {
        setMessages((prev) => {
          const updated = prev.filter((m) => m.id !== evt.messageId);
          saveStoredMessages(updated);
          return updated;
        });
      } else if (evt.type === 'typing') {
        setTypingUsers((prev) => {
          if (evt.isTyping) {
            return prev.includes(evt.userAlias) ? prev : [...prev, evt.userAlias];
          } else {
            return prev.filter((u) => u !== evt.userAlias);
          }
        });
      } else if (evt.type === 'presence' || evt.type === 'presence_query') {
        setOnlineCount(realtimeHub.getOnlineCount());
      }
    });

    const interval = setInterval(() => {
      setOnlineCount(realtimeHub.getOnlineCount());
    }, 5000);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, [currentUser]);

  // Scroll to bottom on initial load or new message
  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  useEffect(() => {
    scrollToBottom(false);
  }, []);

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(true);
    }
  }, [messages.length]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 150);
  };

  // Send message
  const handleSendMessage = ({
    type,
    content,
    mediaName,
    mediaDuration,
    expiresInSeconds,
  }: {
    type: MessageType;
    content: string;
    mediaName?: string;
    mediaDuration?: number;
    expiresInSeconds?: number;
  }) => {
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: currentUser.id,
      senderAlias: currentUser.alias,
      avatarColor: currentUser.avatarColor,
      type,
      content,
      mediaName,
      mediaDuration,
      timestamp: Date.now(),
      expiresAt: expiresInSeconds ? Date.now() + expiresInSeconds * 1000 : undefined,
      reactions: {},
    };

    setMessages((prev) => {
      const updated = [...prev, newMessage];
      saveStoredMessages(updated);
      return updated;
    });

    realtimeHub.broadcast({
      type: 'chat_message',
      message: newMessage,
    });

    // Fun confetti for celebratory texts
    if (content.toLowerCase().includes('welcome') || content.toLowerCase().includes('party')) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    }

    setTimeout(() => scrollToBottom(true), 50);
  };

  // React to message
  const handleReact = (messageId: string, emoji: string) => {
    setMessages((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== messageId) return m;
        const currentReactions = { ...(m.reactions || {}) };
        const users = currentReactions[emoji] || [];
        if (users.includes(currentUser.alias)) {
          currentReactions[emoji] = users.filter((u) => u !== currentUser.alias);
        } else {
          currentReactions[emoji] = [...users, currentUser.alias];
        }
        return { ...m, reactions: currentReactions };
      });
      saveStoredMessages(updated);
      return updated;
    });

    realtimeHub.broadcast({
      type: 'reaction',
      messageId,
      emoji,
      userAlias: currentUser.alias,
    });
  };

  // Delete message
  const handleDeleteMessage = (messageId: string) => {
    setMessages((prev) => {
      const updated = prev.filter((m) => m.id !== messageId);
      saveStoredMessages(updated);
      return updated;
    });

    realtimeHub.broadcast({
      type: 'delete_message',
      messageId,
    });
  };

  // Clear all room messages
  const handleClearAll = () => {
    if (window.confirm('Vanish all transmissions in this global channel?')) {
      setMessages([]);
      saveStoredMessages([]);
    }
  };

  // Typing emitter
  const handleTyping = (isTyping: boolean) => {
    realtimeHub.broadcast({
      type: 'typing',
      userAlias: currentUser.alias,
      isTyping,
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-[#070b14] text-slate-100 select-none font-sans overflow-hidden">
      {/* Top Header */}
      <header className="px-4 py-3 bg-[#0b1222]/90 border-b border-cyan-500/20 backdrop-blur-md flex items-center justify-between shrink-0 shadow-lg">
        {/* Left: Stealth & Title */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Radio className="w-5 h-5 text-white" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0b1222] rounded-full animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-mono">
                <span>CHANNEL_GLOBAL</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-cyan-950 text-cyan-400 border border-cyan-500/30 rounded font-normal">
                  #APAP
                </span>
              </h2>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                {onlineCount} encrypted peers
              </span>
              <span>•</span>
              <span className="text-slate-400 font-mono">You: {currentUser.alias}</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Voice call toggle */}
          <button
            onClick={() => setIsVoiceCallActive(!isVoiceCallActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              isVoiceCallActive
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30'
            }`}
            title="Start group voice room"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isVoiceCallActive ? 'Leave Voice' : 'Voice Room'}
            </span>
          </button>

          {/* Purge / Vanish */}
          <button
            onClick={handleClearAll}
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition-colors"
            title="Vanish all room transmissions"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* BaaS Settings / Netlify Export */}
          <button
            onClick={() => setShowConfigModal(true)}
            className="p-2 text-slate-400 hover:text-cyan-400 rounded-xl hover:bg-slate-800 transition-colors"
            title="Room settings & Netlify export"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* CRITICAL: PANIC BUTTON */}
          <button
            onClick={onPanic}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 text-xs font-semibold transition-all shadow-md hover:scale-105 cursor-pointer ml-1"
            title="Emergency Switch back to Notes (Hotkey: ESC)"
          >
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>PANIC (ESC)</span>
          </button>
        </div>
      </header>

      {/* Voice Call Overlay */}
      {isVoiceCallActive && (
        <VoiceCallOverlay
          currentUser={currentUser}
          onLeaveCall={() => setIsVoiceCallActive(false)}
        />
      )}

      {/* Messages List Area */}
      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-1 relative"
      >
        {/* Encrypted channel greeting banner */}
        <div className="mx-auto max-w-md my-4 p-4 rounded-2xl bg-[#0d1629]/70 border border-cyan-500/20 text-center">
          <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-2">
            <Lock className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-mono font-semibold text-slate-200">
            SECURE PEER MESH CHANNEL #APAP
          </h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Transmissions are anonymous, broadcast across active nodes, and hidden beneath QuickNote. Hit <kbd className="px-1 py-0.5 bg-slate-800 rounded text-rose-300 border border-slate-700">ESC</kbd> anytime for instant disguise.
          </p>
        </div>

        {messages.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            currentUser={currentUser}
            onReact={handleReact}
            onDeleteMessage={handleDeleteMessage}
          />
        ))}

        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="fixed bottom-20 right-6 p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-xl transition-all hover:scale-110 z-20"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
        )}
      </main>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="px-6 py-1 text-[11px] font-mono text-cyan-400/80 bg-[#0b1222]/50 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span>{typingUsers.join(', ')} is typing...</span>
        </div>
      )}

      {/* Input Bar */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onOpenDoodle={() => setShowDoodleModal(true)}
        onOpenGifPicker={() => setShowGifModal(true)}
        onTyping={handleTyping}
      />

      {/* Modals */}
      {showDoodleModal && (
        <DoodleModal
          onClose={() => setShowDoodleModal(false)}
          onSendDoodle={(dataUrl) => {
            handleSendMessage({ type: 'doodle', content: dataUrl });
          }}
        />
      )}

      {showGifModal && (
        <GifPickerModal
          onClose={() => setShowGifModal(false)}
          onSelectGif={(url) => {
            handleSendMessage({ type: 'gif', content: url });
          }}
        />
      )}

      {showConfigModal && (
        <BaaSConfigModal
          currentConfig={baasConfig}
          currentUser={currentUser}
          onSaveConfig={(cfg) => {
            setBaasConfig(cfg);
            saveBaaSConfig(cfg);
          }}
          onUpdateUser={(usr) => {
            setCurrentUser(usr);
            saveUserProfile(usr);
          }}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </div>
  );
};
