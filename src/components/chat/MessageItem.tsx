import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Clock,
  Bomb,
  SmilePlus,
  Volume2,
  Maximize2,
  Trash2,
} from 'lucide-react';
import { ChatMessage, UserProfile } from '../../types';

interface MessageItemProps {
  message: ChatMessage;
  currentUser: UserProfile;
  onReact: (messageId: string, emoji: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

const QUICK_EMOJIS = ['🔥', '❤️', '😂', '😮', '👏', '👻', '🤫'];

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  currentUser,
  onReact,
  onDeleteMessage,
}) => {
  const isSelf = message.senderId === currentUser.id;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioSpeed, setAudioSpeed] = useState<number>(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Self-destruct countdown
  useEffect(() => {
    if (!message.expiresAt) return;

    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((message.expiresAt! - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        onDeleteMessage(message.id);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [message.expiresAt, message.id, onDeleteMessage]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.playbackRate = audioSpeed;
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const cycleSpeed = () => {
    const nextSpeed = audioSpeed === 1 ? 1.5 : audioSpeed === 1.5 ? 2 : 1;
    setAudioSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleAudioTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 1;
    setAudioProgress((current / total) * 100);
  };

  const handleAudioEnded = () => {
    setIsPlayingAudio(false);
    setAudioProgress(0);
  };

  const timeString = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`group relative flex gap-3 px-4 py-2 transition-colors hover:bg-white/[0.02] ${
        isSelf ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-md border border-white/10"
        style={{
          backgroundColor: message.avatarColor,
          color: '#090d16',
        }}
      >
        {message.senderAlias.substring(0, 2).toUpperCase()}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${
          isSelf ? 'items-end' : 'items-start'
        }`}
      >
        {/* Header: Alias & Time */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-mono font-semibold"
            style={{ color: message.avatarColor }}
          >
            {message.senderAlias}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">{timeString}</span>

          {/* Self-destruct indicator */}
          {remainingSeconds !== null && (
            <span className="flex items-center gap-1 text-[10px] font-mono text-rose-400 bg-rose-950/60 border border-rose-500/30 px-1.5 py-0.2 rounded-full animate-pulse">
              <Bomb className="w-2.5 h-2.5" />
              <span>{remainingSeconds}s</span>
            </span>
          )}
        </div>

        {/* Message Content Bubble */}
        <div
          className={`relative rounded-2xl p-3.5 text-xs shadow-md border transition-all ${
            isSelf
              ? 'bg-[#121c33] border-cyan-500/30 text-slate-100 rounded-tr-xs'
              : 'bg-[#0f172a] border-slate-800 text-slate-200 rounded-tl-xs'
          }`}
        >
          {/* TEXT */}
          {message.type === 'text' && (
            <p className="whitespace-pre-wrap leading-relaxed select-text font-sans text-sm">
              {message.content}
            </p>
          )}

          {/* IMAGE */}
          {message.type === 'image' && (
            <div className="relative rounded-xl overflow-hidden group/img max-w-sm border border-cyan-500/20">
              <img
                src={message.content}
                alt="Shared visual"
                className="w-full max-h-80 object-cover cursor-pointer rounded-lg hover:brightness-105 transition-all"
                onClick={() => setFullscreenImage(message.content)}
              />
              <button
                onClick={() => setFullscreenImage(message.content)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* DOODLE */}
          {message.type === 'doodle' && (
            <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-black/60 p-1">
              <img
                src={message.content}
                alt="Hand-drawn sketch"
                className="w-full max-h-72 object-contain rounded-lg cursor-pointer"
                onClick={() => setFullscreenImage(message.content)}
              />
              <div className="text-[10px] text-cyan-400 font-mono mt-1 text-center">
                ✏️ Cyber Sketch
              </div>
            </div>
          )}

          {/* GIF */}
          {message.type === 'gif' && (
            <div className="rounded-xl overflow-hidden border border-purple-500/30 max-w-sm">
              <img
                src={message.content}
                alt="Animated reaction"
                className="w-full max-h-72 object-cover rounded-lg"
              />
            </div>
          )}

          {/* VIDEO */}
          {message.type === 'video' && (
            <div className="rounded-xl overflow-hidden max-w-md border border-cyan-500/30 bg-black">
              <video
                src={message.content}
                controls
                className="w-full max-h-80 rounded-lg"
              />
            </div>
          )}

          {/* AUDIO VOICE MESSAGE */}
          {message.type === 'audio' && (
            <div className="flex items-center gap-3 min-w-[220px] sm:min-w-[260px] py-1">
              <audio
                ref={audioRef}
                src={message.content}
                onTimeUpdate={handleAudioTimeUpdate}
                onEnded={handleAudioEnded}
                preload="metadata"
              />

              <button
                onClick={toggleAudio}
                className="w-9 h-9 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              >
                {isPlayingAudio ? (
                  <Pause className="w-4 h-4 fill-slate-950" />
                ) : (
                  <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
                )}
              </button>

              {/* Waveform bars simulation */}
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="flex items-center gap-0.5 h-7">
                  {[20, 50, 80, 40, 100, 70, 30, 90, 60, 45, 85, 35, 65, 95, 40, 25].map(
                    (h, i) => {
                      const barPercent = (i / 16) * 100;
                      const isPast = audioProgress >= barPercent;
                      return (
                        <div
                          key={i}
                          className="flex-1 rounded-full transition-all duration-75"
                          style={{
                            height: `${h}%`,
                            backgroundColor: isPast ? '#06b6d4' : '#334155',
                          }}
                        />
                      );
                    }
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-cyan-400" />
                    <span>Voice Note</span>
                  </span>
                  <button
                    onClick={cycleSpeed}
                    className="hover:text-cyan-300 px-1 rounded bg-slate-800/60 font-semibold"
                  >
                    {audioSpeed}x
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Existing Reactions Badges */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {Object.entries(message.reactions).map(([emoji, users]) => {
              if (users.length === 0) return null;
              const hasReacted = users.includes(currentUser.alias);
              return (
                <button
                  key={emoji}
                  onClick={() => onReact(message.id, emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] border transition-all ${
                    hasReacted
                      ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                  title={users.join(', ')}
                >
                  <span>{emoji}</span>
                  <span className="font-mono text-[10px]">{users.length}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Action Menu (Reaction bar & Delete) */}
      <div
        className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#0b1222]/90 border border-slate-700 backdrop-blur-md rounded-xl p-1 shadow-lg z-10 ${
          isSelf ? 'left-4' : 'right-4'
        }`}
      >
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="React to message"
          >
            <SmilePlus className="w-3.5 h-3.5" />
          </button>

          {showEmojiPicker && (
            <div className="absolute bottom-full mb-1 left-0 flex items-center gap-1 bg-[#090e1a] border border-cyan-500/30 rounded-xl p-1.5 shadow-2xl z-20">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(message.id, emoji);
                    setShowEmojiPicker(false);
                  }}
                  className="hover:scale-125 transition-transform p-1 text-sm"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {isSelf && (
          <button
            onClick={() => onDeleteMessage(message.id)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Delete transmission"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Fullscreen image modal preview */}
      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Expanded visual"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl border border-cyan-500/40 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
