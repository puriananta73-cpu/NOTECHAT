export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  pinned: boolean;
  updatedAt: number;
  createdAt: number;
  color?: string;
}

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'doodle' | 'gif';

export interface Reaction {
  emoji: string;
  users: string[]; // array of user aliases
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderAlias: string;
  avatarColor: string;
  type: MessageType;
  content: string; // text content, or base64 / URL for media
  mediaName?: string;
  mediaDuration?: number; // for audio in seconds
  timestamp: number;
  expiresAt?: number; // self-destruct timestamp
  reactions?: Record<string, string[]>; // emoji -> userAlias[]
}

export interface UserProfile {
  id: string;
  alias: string;
  avatarColor: string;
  isMuted?: boolean;
}

export interface VoiceParticipant {
  id: string;
  alias: string;
  avatarColor: string;
  isMuted: boolean;
  isSpeaking: boolean;
  audioLevel?: number;
}

export interface BaaSConfig {
  provider: 'local-broadcast' | 'firebase' | 'supabase';
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  supabaseConfig?: {
    url: string;
    anonKey: string;
  };
}
