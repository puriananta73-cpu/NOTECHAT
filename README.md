# NoteChat (QuickNote Stealth Group Chat)

**NoteChat** is a desktop-first web application engineered to disguise a fully-featured, anonymous real-time group chat inside an innocent, authentic personal notes application ("QuickNote").

Designed to be hosted statically on **Netlify** or **GitHub Pages**, with out-of-the-box real-time peer mesh and optional BaaS backends (Firebase / Supabase).

---

## 🤫 Secret Access & Controls

- **Unlock Trigger**: Create a new note and type `#APAP` as the note title. The note will *never* be saved to your notes list; instead, the application will smoothly dissolve into the secret dark-mode chat room.
- **Hidden Keyboard Shortcut**: Press `Ctrl + Shift + A` (or `Cmd + Shift + A` on macOS) from anywhere in QuickNote.
- **Panic Button (Instant Disguise)**: Press the <kbd>Esc</kbd> key or click the discrete red `PANIC (ESC)` button in the header. The app instantaneously swaps back to the innocent QuickNote screen with zero trace.
- **No Clues**: In normal notes mode, there are **no hints, tooltips, or watermarks** indicating that `#APAP` exists.

---

## ✨ Features

### 1. Disguise Layer (QuickNote)
- Authentic Apple Notes / Notion aesthetic with folders (Work, Personal, Reading, Home).
- Full Markdown & checklist toolbar (Bold, Italic, Headings, Bullet Lists, Checkboxes).
- Local storage persistence with preloaded realistic notes.
- Note search, pinning, colored note tints, and word/character counters.
- Optional 4-digit PIN lock screen in settings.

### 2. Secret Chat Room (Channel #APAP)
- **One Shared Global Room**: Shared peer group channel with neon-accented cyberpunk UI.
- **Anonymous Identity**: Auto-generated alias (e.g. `User_x7k2`, `Cipher_9b`) with custom avatar colors.
- **Real-Time Messaging**: Cross-tab/window mesh sync using `BroadcastChannel` and `localStorage` event bridges.
- **Voice Messages (Microphone)**: Real `MediaRecorder` API with live recording waveform, elapsed duration timer, and inline player with multi-speed playback (1x, 1.5x, 2x).
- **Group Voice Call Room**: Real WebRTC audio stream room with live microphone meters, active speaker indicators, and mute/unmute controls.
- **Media Uploads**: Instant image and video sharing with inline preview and fullscreen expand.
- **Doodle / Sketch Tool**: Interactive HTML5 canvas with neon colors, brush size selector, and direct transmission.
- **GIF & Visuals Picker**: Curated searchable GIFs and reaction animations.
- **Self-Destruct Timers**: Set messages to disintegrate after 10s, 30s, 1m, 5m, 1h, or 24h with animated countdowns.
- **Reactions**: Hover over messages to react with emojis (`🔥`, `❤️`, `😂`, `😮`, `👏`, `👻`, `🤫`).
- **Typing Indicators & Peer Presence**: Live active peer counters and typing status.

---

## 🚀 Deployment Instructions

### Deploy to Netlify

#### Option A: Drag & Drop via Downloaded .ZIP
1. In the Secret Chat room, click the **Settings** gear icon in the top header.
2. Click **Download Project .ZIP Archive**.
3. Extract the downloaded zip file or upload it directly to [Netlify Drop](https://app.netlify.com/drop).
4. Your stealth NoteChat website is live!

#### Option B: GitHub Repository Sync
1. Push this repository to GitHub.
2. Connect the repository to Netlify:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Netlify will automatically detect `netlify.toml` and configure SPA routing.

---

### Deploy to GitHub Pages
1. In `vite.config.ts`, verify `base: './'` is set (already configured).
2. Build the static assets:
   ```bash
   npm run build
   ```
3. Deploy the generated `dist/` directory to the `gh-pages` branch using GitHub Actions or `gh-pages` CLI:
   ```bash
   npx gh-pages -d dist
   ```

---

## ⚙️ Backend BaaS Configuration (Firebase / Supabase)

NoteChat works immediately with its built-in zero-config **Local Mesh & WebRTC** engine. If you want to connect external BaaS databases:

1. Click the **Settings** gear icon in the chat room header.
2. Under **Real-time Backend Engine**, choose **Firebase** or **Supabase**.
3. Enter your Project ID and API Key / Anon Key.
4. Settings are stored in your secure local configuration.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Run local dev server
npm run dev

# 3. Build for production
npm run build
```
