import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Image,
  Video,
  Mic,
  Square,
  Bomb,
  Smile,
  Palette,
  Film,
  X,
  Paperclip,
  Check,
} from 'lucide-react';
import { MessageType } from '../../types';

interface ChatInputProps {
  onSendMessage: (params: {
    type: MessageType;
    content: string;
    mediaName?: string;
    mediaDuration?: number;
    expiresInSeconds?: number;
  }) => void;
  onOpenDoodle: () => void;
  onOpenGifPicker: () => void;
  onTyping: (isTyping: boolean) => void;
}

const SELF_DESTRUCT_OPTIONS = [
  { label: 'Off', seconds: 0 },
  { label: '10s', seconds: 10 },
  { label: '30s', seconds: 30 },
  { label: '1m', seconds: 60 },
  { label: '5m', seconds: 300 },
  { label: '1h', seconds: 3600 },
  { label: '24h', seconds: 86400 },
];

const EMOJI_PALETTE = ['👍', '🔥', '✨', '😂', '💀', '👀', '🤫', '🔒', '💯', '🚀', '⚡', '🎉'];

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenDoodle,
  onOpenGifPicker,
  onTyping,
}) => {
  const [text, setText] = useState('');
  const [destructSeconds, setDestructSeconds] = useState<number>(0);
  const [showDestructMenu, setShowDestructMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingMedia, setPendingMedia] = useState<{
    file: File;
    dataUrl: string;
    type: 'image' | 'video';
  } | null>(null);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle typing indicator
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = window.setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (pendingMedia) {
      onSendMessage({
        type: pendingMedia.type,
        content: pendingMedia.dataUrl,
        mediaName: pendingMedia.file.name,
        expiresInSeconds: destructSeconds > 0 ? destructSeconds : undefined,
      });
      setPendingMedia(null);
      return;
    }

    if (!text.trim()) return;

    onSendMessage({
      type: 'text',
      content: text.trim(),
      expiresInSeconds: destructSeconds > 0 ? destructSeconds : undefined,
    });

    setText('');
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  // Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPendingMedia({
          file,
          dataUrl: event.target.result as string,
          type: 'image',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Video Upload
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPendingMedia({
          file,
          dataUrl: event.target.result as string,
          type: 'video',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Audio recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            onSendMessage({
              type: 'audio',
              content: reader.result as string,
              mediaDuration: recordingDuration,
              expiresInSeconds: destructSeconds > 0 ? destructSeconds : undefined,
            });
          }
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setRecordingDuration(0);
        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordTimerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio capture error', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      audioChunksRef.current = [];
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingDuration(0);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
  };

  return (
    <div className="p-3 bg-[#0b1222] border-t border-cyan-900/40 relative">
      {/* Self Destruct Selector dropdown */}
      {showDestructMenu && (
        <div className="absolute bottom-full mb-2 left-4 bg-[#090e1a] border border-cyan-500/30 rounded-xl p-2 shadow-2xl z-30 flex flex-col gap-1 min-w-[150px]">
          <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Bomb className="w-3 h-3 text-rose-400" />
            <span>Self-Destruct Timer</span>
          </div>
          {SELF_DESTRUCT_OPTIONS.map((opt) => (
            <button
              key={opt.seconds}
              onClick={() => {
                setDestructSeconds(opt.seconds);
                setShowDestructMenu(false);
              }}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                destructSeconds === opt.seconds
                  ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span>{opt.label}</span>
              {destructSeconds === opt.seconds && <Check className="w-3 h-3 text-cyan-400" />}
            </button>
          ))}
        </div>
      )}

      {/* Emoji picker dropdown */}
      {showEmojiPicker && (
        <div className="absolute bottom-full mb-2 right-4 bg-[#090e1a] border border-cyan-500/30 rounded-xl p-2.5 shadow-2xl z-30 grid grid-cols-6 gap-2">
          {EMOJI_PALETTE.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setText((prev) => prev + emoji);
                setShowEmojiPicker(false);
              }}
              className="text-lg hover:scale-125 transition-transform p-1 rounded hover:bg-slate-800"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Media Pending Preview Box */}
      {pendingMedia && (
        <div className="mb-2 p-2 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pendingMedia.type === 'image' ? (
              <img
                src={pendingMedia.dataUrl}
                alt="Upload preview"
                className="w-12 h-12 object-cover rounded-lg border border-cyan-500/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-black flex items-center justify-center border border-cyan-500/40">
                <Video className="w-5 h-5 text-cyan-400" />
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-slate-200 truncate max-w-[200px]">
                {pendingMedia.file.name}
              </p>
              <p className="text-[10px] text-cyan-400 capitalize">
                {pendingMedia.type} attachment ready
              </p>
            </div>
          </div>
          <button
            onClick={() => setPendingMedia(null)}
            className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Audio Recording Live Bar */}
      {isRecording ? (
        <div className="flex items-center justify-between bg-rose-950/40 border border-rose-500/40 rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <div className="flex items-center gap-1.5 font-mono text-rose-400 text-xs">
              <Mic className="w-4 h-4" />
              <span>
                Recording: {Math.floor(recordingDuration / 60)}:
                {(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelRecording}
              className="p-1.5 text-slate-400 hover:text-rose-300 rounded-lg text-xs"
              title="Cancel recording"
            >
              Cancel
            </button>
            <button
              onClick={stopRecording}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/30"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Send Audio</span>
            </button>
          </div>
        </div>
      ) : (
        /* Normal Chat Input Row */
        <div className="flex items-center gap-2">
          {/* Action buttons (File, Doodle, GIF, Timer) */}
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={videoInputRef}
              onChange={handleVideoFileChange}
              accept="video/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Send image"
            >
              <Image className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => videoInputRef.current?.click()}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Send video"
            >
              <Video className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenDoodle}
              className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Draw a doodle"
            >
              <Palette className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenGifPicker}
              className="p-2 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-xl transition-colors"
              title="Send GIF"
            >
              <Film className="w-4 h-4" />
            </button>

            {/* Self-destruct timer pill button */}
            <button
              type="button"
              onClick={() => setShowDestructMenu(!showDestructMenu)}
              className={`p-1.5 px-2 rounded-xl text-xs flex items-center gap-1 transition-all ${
                destructSeconds > 0
                  ? 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="Set self-destruct countdown"
            >
              <Bomb className="w-3.5 h-3.5" />
              {destructSeconds > 0 && (
                <span className="font-mono text-[10px]">
                  {SELF_DESTRUCT_OPTIONS.find((o) => o.seconds === destructSeconds)?.label}
                </span>
              )}
            </button>
          </div>

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Send message to room..."
              className="w-full pl-3.5 pr-8 py-2 text-xs bg-slate-900 border border-cyan-900/50 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 resize-none max-h-24 font-sans"
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2.5 top-2.5 text-slate-500 hover:text-cyan-400 transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>
          </div>

          {/* Voice Record button OR Send button */}
          {text.trim() || pendingMedia ? (
            <button
              onClick={handleSubmit}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
              title="Send transmission"
            >
              <Send className="w-4 h-4 fill-slate-950" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 transition-all cursor-pointer"
              title="Record voice message"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
