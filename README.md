# ⚡ FlashForge — AI-Powered Flashcard Engine (Pro Edition)

Transform any PDF into deeply intelligent flashcards in minutes. Powered by **Google Gemini 1.5 Flash**, featuring a custom Spaced Repetition System (SRS), 3D animations, and pedagogical context tracking.

---

## ✨ Features

- **Google Gemini 1.5 Integration** — high-speed card generation with pedagogical templates
- **SM-2 Spaced Repetition** — custom scheduling for optimal long-term retention
- **"Show Source" Technology** — instantly see the exact paragraph used to create any card
- **Explain Simpler** — built-in "AI Tutor" to break down complex cards into plain language
- **3D Card Flip Animations** — immersive study experience with Framer Motion
- **Secure Architecture** — all AI calls and parsing handled strictly server-side

---

## 🚀 Quick Start

### 1. Installation

```bash
cd d:\flashcard
npm install
```

### 2. Configure Environment

Open `.env.local` in the root directory and set your key:

```env
GEMINI_API_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Run Development Server

```bash
npm run dev -- -p 3002
```

Open [http://localhost:3002](http://localhost:3002)

---

## 🔒 Security & Performance

- **Zod Validation**: API types are strictly enforced.
- **SSE Streaming**: Progress is streamed to the UI in real-time.
- **Clean TS Build**: Zero TypeScript errors (`tsc --noEmit` pass).

---

## 📄 License

MIT — build something great.
