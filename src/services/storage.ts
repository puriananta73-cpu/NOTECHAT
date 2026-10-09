import { Note, ChatMessage, UserProfile, BaaSConfig } from '../types';

const NOTES_KEY = 'quicknote_notes_v1';
const PIN_KEY = 'quicknote_pin_v1';
const CHAT_MSGS_KEY = 'notechat_messages_v1';
const USER_PROFILE_KEY = 'notechat_user_profile_v1';
const BAAS_CONFIG_KEY = 'notechat_baas_config_v1';

const DEFAULT_NOTES: Note[] = [
  {
    id: 'note-1',
    title: 'Weekly Team Sync Notes',
    content: `• Reviewed Q3 milestone deliverables\n• Design system tokens finalized for desktop release\n• Frontend audit: accessibility score improved to 98\n• Next action item: verify offline sync fallback with product manager on Thursday.`,
    category: 'Work',
    pinned: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    color: '#ffffff',
  },
  {
    id: 'note-2',
    title: 'Weekend Grocery & Household Restock',
    content: `[ ] Cold brew coffee beans (Ethiopian Yirgacheffe)\n[ ] Oat milk (extra creamy)\n[ ] Sourdough bread from bakery\n[ ] Avocados & cherry tomatoes\n[ ] Olive oil & sea salt flakes\n[ ] Dishwasher pods and microfiber cloths`,
    category: 'Personal',
    pinned: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 18,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    color: '#fef3c7', // amber soft
  },
  {
    id: 'note-3',
    title: 'Books & Articles Reading Queue',
    content: `1. Designing Data-Intensive Applications - Martin Kleppmann (Ch. 7)\n2. The Pragmatic Programmer - 20th Anniversary Edition\n3. Article: "Zero-latency UI patterns in distributed systems"\n4. Deep Work - Cal Newport (re-read notes on focus blocks)`,
    category: 'Reading',
    pinned: false,
    updatedAt: Date.now() - 1000 * 60 * 60 * 40,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    color: '#e0f2fe', // sky soft
  },
  {
    id: 'note-4',
    title: 'Apartment Maintenance & Utilities',
    content: `Building Manager: (555) 019-2834\nWiFi Router IP: 192.168.1.1\nFilter replacement cycle: Every 90 days (next due late November)\nPackage room locker code saved in key ring.`,
    category: 'Home',
    pinned: false,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    color: '#f3e8ff', // purple soft
  },
];

const NEON_COLORS = [
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#14b8a6', // teal
  '#a855f7', // purple
];

export const getStoredNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) {
      localStorage.setItem(NOTES_KEY, JSON.stringify(DEFAULT_NOTES));
      return DEFAULT_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_NOTES;
  }
};

export const saveStoredNotes = (notes: Note[]): void => {
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to localStorage', err);
  }
};

export const getStoredPin = (): string | null => {
  return localStorage.getItem(PIN_KEY);
};

export const setStoredPin = (pin: string | null): void => {
  if (pin) {
    localStorage.setItem(PIN_KEY, pin);
  } else {
    localStorage.removeItem(PIN_KEY);
  }
};

export const getOrCreateUserProfile = (): UserProfile => {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }

  const randomHex = Math.random().toString(36).substring(2, 6);
  const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
  const profile: UserProfile = {
    id: `usr_${Date.now()}_${randomHex}`,
    alias: `User_${randomHex}`,
    avatarColor: color,
  };
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // ignore
  }
  return profile;
};

export const saveUserProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save profile', err);
  }
};

// Seed demo messages so the chat is lively on first secret unlock
const SEED_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'seed-msg-1',
    senderId: 'usr_sys_01',
    senderAlias: 'Shadow_4x',
    avatarColor: '#06b6d4',
    type: 'text',
    content: 'Room channel established. All transmissions here are private and isolated from the notes layer.',
    timestamp: Date.now() - 1000 * 60 * 15,
    reactions: { '🔒': ['Shadow_4x', 'Ghost_9b'] },
  },
  {
    id: 'seed-msg-2',
    senderId: 'usr_sys_02',
    senderAlias: 'Cipher_9b',
    avatarColor: '#8b5cf6',
    type: 'text',
    content: 'Panic key (Esc) is hot. Hit Esc anytime to jump back into QuickNote without leaving a trace.',
    timestamp: Date.now() - 1000 * 60 * 12,
    reactions: { '⚡': ['Cipher_9b'], '🔥': ['Shadow_4x'] },
  },
  {
    id: 'seed-msg-3',
    senderId: 'usr_sys_03',
    senderAlias: 'Apex_11',
    avatarColor: '#10b981',
    type: 'text',
    content: 'Voice notes, files, doodles, and peer audio rooms are ready. Test microphone or drop a sketch!',
    timestamp: Date.now() - 1000 * 60 * 8,
    reactions: { '👀': ['Apex_11'] },
  },
];

export const getStoredMessages = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(CHAT_MSGS_KEY);
    if (!raw) {
      localStorage.setItem(CHAT_MSGS_KEY, JSON.stringify(SEED_CHAT_MESSAGES));
      return SEED_CHAT_MESSAGES;
    }
    const parsed: ChatMessage[] = JSON.parse(raw);
    const now = Date.now();
    // Filter expired self-destruct messages
    const valid = parsed.filter((m) => !m.expiresAt || m.expiresAt > now);
    return valid;
  } catch {
    return SEED_CHAT_MESSAGES;
  }
};

export const saveStoredMessages = (messages: ChatMessage[]): void => {
  try {
    const now = Date.now();
    const valid = messages.filter((m) => !m.expiresAt || m.expiresAt > now);
    localStorage.setItem(CHAT_MSGS_KEY, JSON.stringify(valid));
  } catch (err) {
    console.error('Failed to save messages', err);
  }
};

export const getBaaSConfig = (): BaaSConfig => {
  try {
    const raw = localStorage.getItem(BAAS_CONFIG_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {
    provider: 'local-broadcast',
  };
};

export const saveBaaSConfig = (config: BaaSConfig): void => {
  try {
    localStorage.setItem(BAAS_CONFIG_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save BaaS config', err);
  }
};
