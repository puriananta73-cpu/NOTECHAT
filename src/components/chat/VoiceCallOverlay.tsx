import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, PhoneOff, Users, Radio } from 'lucide-react';
import { UserProfile, VoiceParticipant } from '../../types';
import { realtimeHub } from '../../services/realtime';

interface VoiceCallOverlayProps {
  currentUser: UserProfile;
  onLeaveCall: () => void;
}

export const VoiceCallOverlay: React.FC<VoiceCallOverlayProps> = ({
  currentUser,
  onLeaveCall,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([
    {
      id: currentUser.id,
      alias: currentUser.alias,
      avatarColor: currentUser.avatarColor,
      isMuted: false,
      isSpeaking: false,
      audioLevel: 0,
    },
    {
      id: 'voice-peer-1',
      alias: 'Cipher_9b',
      avatarColor: '#8b5cf6',
      isMuted: false,
      isSpeaking: true,
      audioLevel: 45,
    },
    {
      id: 'voice-peer-2',
      alias: 'Apex_11',
      avatarColor: '#10b981',
      isMuted: true,
      isSpeaking: false,
      audioLevel: 0,
    },
  ]);

  const [localAudioLevel, setLocalAudioLevel] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Announce voice join
    realtimeHub.broadcast({
      type: 'voice_join',
      participant: {
        id: currentUser.id,
        alias: currentUser.alias,
        avatarColor: currentUser.avatarColor,
        isMuted: false,
        isSpeaking: false,
        audioLevel: 0,
      },
    });

    // Request actual microphone stream for genuine WebRTC audio capture & visualizer
    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyserRef.current = analyser;

        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const checkAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          const level = Math.min(100, Math.round((avg / 128) * 100));
          setLocalAudioLevel(level);

          const isSpeaking = level > 15;
          setParticipants((prev) =>
            prev.map((p) =>
              p.id === currentUser.id
                ? { ...p, audioLevel: level, isSpeaking }
                : p
            )
          );

          animationFrameRef.current = requestAnimationFrame(checkAudio);
        };

        checkAudio();
      } catch (err) {
        console.warn('Microphone access denied or not available, using simulated audio levels', err);
        // Fallback simulation
        const interval = setInterval(() => {
          setParticipants((prev) =>
            prev.map((p) => {
              if (p.id === 'voice-peer-1') {
                const speaking = Math.random() > 0.4;
                return {
                  ...p,
                  isSpeaking: speaking,
                  audioLevel: speaking ? Math.floor(Math.random() * 60) + 20 : 0,
                };
              }
              return p;
            })
          );
        }, 1200);
        return () => clearInterval(interval);
      }
    };

    initMic();

    // Listen to realtime voice events
    const unsub = realtimeHub.subscribe((evt) => {
      if (evt.type === 'voice_join') {
        setParticipants((prev) => {
          if (prev.some((p) => p.id === evt.participant.id)) return prev;
          return [...prev, evt.participant];
        });
      } else if (evt.type === 'voice_leave') {
        setParticipants((prev) => prev.filter((p) => p.id !== evt.participantId));
      }
    });

    return () => {
      unsub();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      realtimeHub.broadcast({
        type: 'voice_leave',
        participantId: currentUser.id,
      });
    };
  }, [currentUser]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
    }
    setParticipants((prev) =>
      prev.map((p) => (p.id === currentUser.id ? { ...p, isMuted: next } : p))
    );
  };

  return (
    <div className="bg-[#0b1222] border-b border-cyan-500/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-medium">
          <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
          <span>Active Mesh Audio Room</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5" />
          <span>{participants.length} connected</span>
        </div>
      </div>

      {/* Participants badges */}
      <div className="flex items-center gap-2 overflow-x-auto py-1">
        {participants.map((p) => (
          <div
            key={p.id}
            className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs transition-all ${
              p.isSpeaking && !p.isMuted
                ? 'border-cyan-400 bg-cyan-950/50 shadow-sm shadow-cyan-500/30 ring-1 ring-cyan-400/50'
                : 'border-slate-800 bg-slate-900/60 text-slate-300'
            }`}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950"
              style={{ backgroundColor: p.avatarColor }}
            >
              {p.alias.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-mono text-[11px] text-slate-200">{p.alias}</span>
            {p.isMuted ? (
              <MicOff className="w-3 h-3 text-rose-400" />
            ) : p.isSpeaking ? (
              <div className="flex items-center gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                <span className="w-0.5 h-3 bg-cyan-300 rounded-full animate-bounce"></span>
                <span className="w-0.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></span>
              </div>
            ) : (
              <Volume2 className="w-3 h-3 text-slate-500" />
            )}
          </div>
        ))}
      </div>

      {/* Call Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
            isMuted
              ? 'bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30'
              : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30'
          }`}
          title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        >
          {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span className="text-[11px]">{isMuted ? 'Muted' : 'Speaking'}</span>
        </button>

        <button
          onClick={onLeaveCall}
          className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-rose-600/30 transition-all"
          title="Disconnect from voice room"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="text-[11px]">Leave Room</span>
        </button>
      </div>
    </div>
  );
};
