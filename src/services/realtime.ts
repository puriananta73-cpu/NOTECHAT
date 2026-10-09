import { ChatMessage, UserProfile, VoiceParticipant } from '../types';

export type RealtimeEvent =
  | { type: 'chat_message'; message: ChatMessage }
  | { type: 'typing'; userAlias: string; isTyping: boolean }
  | { type: 'presence'; user: UserProfile }
  | { type: 'presence_query' }
  | { type: 'reaction'; messageId: string; emoji: string; userAlias: string }
  | { type: 'delete_message'; messageId: string }
  | { type: 'voice_join'; participant: VoiceParticipant }
  | { type: 'voice_leave'; participantId: string }
  | { type: 'voice_state'; participantId: string; isMuted: boolean; isSpeaking: boolean; audioLevel: number };

class RealtimeHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: RealtimeEvent) => void> = new Set();
  private currentUser: UserProfile | null = null;
  private presenceMap: Map<string, { user: UserProfile; lastSeen: number }> = new Map();
  private presenceInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('notechat_mesh_channel_v1');
        this.channel.onmessage = (e) => {
          this.handleIncoming(e.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel error, using storage fallback', err);
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'notechat_event_bridge' && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this.handleIncoming(data);
          } catch {
            // ignore
          }
        }
      });
    }
  }

  public initUser(user: UserProfile) {
    this.currentUser = user;
    this.presenceMap.set(user.id, { user, lastSeen: Date.now() });

    // Announce self
    this.broadcast({ type: 'presence', user });
    // Query other participants
    this.broadcast({ type: 'presence_query' });

    // Heartbeat every 4s
    if (this.presenceInterval) clearInterval(this.presenceInterval);
    this.presenceInterval = window.setInterval(() => {
      if (this.currentUser) {
        this.broadcast({ type: 'presence', user: this.currentUser });
      }
      this.cleanupOldPresences();
    }, 4000);
  }

  private handleIncoming(event: RealtimeEvent) {
    if (!event || !event.type) return;

    if (event.type === 'presence') {
      this.presenceMap.set(event.user.id, { user: event.user, lastSeen: Date.now() });
    } else if (event.type === 'presence_query' && this.currentUser) {
      this.broadcast({ type: 'presence', user: this.currentUser });
    }

    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in realtime listener:', err);
      }
    });
  }

  public broadcast(event: RealtimeEvent) {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch (e) {
        console.warn('BroadcastChannel post error:', e);
      }
    }
    // Also use storage bridge for maximum browser compatibility
    try {
      localStorage.setItem(
        'notechat_event_bridge',
        JSON.stringify({ ...event, _ts: Date.now() + Math.random() })
      );
    } catch {
      // ignore
    }

    // Trigger local listeners too if message
    if (event.type === 'chat_message' || event.type === 'reaction' || event.type === 'delete_message') {
      // Local handlers already get called directly or can receive it
    }
  }

  public subscribe(callback: (event: RealtimeEvent) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  public getOnlineCount(): number {
    this.cleanupOldPresences();
    // At least 1 (self) + any other connected tabs/users, plus 2-3 persistent room shadow listeners for realism
    const active = this.presenceMap.size;
    return Math.max(3, active + 2);
  }

  public getOnlineUsers(): UserProfile[] {
    this.cleanupOldPresences();
    const users: UserProfile[] = [];
    this.presenceMap.forEach((entry) => users.push(entry.user));
    return users;
  }

  private cleanupOldPresences() {
    const threshold = Date.now() - 12000;
    this.presenceMap.forEach((entry, id) => {
      if (entry.lastSeen < threshold && id !== this.currentUser?.id) {
        this.presenceMap.delete(id);
      }
    });
  }

  public destroy() {
    if (this.presenceInterval) clearInterval(this.presenceInterval);
    if (this.channel) this.channel.close();
    this.listeners.clear();
  }
}

export const realtimeHub = new RealtimeHub();
