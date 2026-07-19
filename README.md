# DhyanLok (ध्यानलोक)

> A calm, minimalist habit tracker, voice-powered daily journal, and focus sanctuary. Built for clarity and daily consistency.

[![Try DhyanLok Live](https://img.shields.io/badge/Live_App-Experience_DhyanLok-black?style=for-the-badge&logo=vercel)](https://dhyanlok.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

---

### 🌐 Experience It Instantly

No installation, zero friction, and no technical setup required. Try the full live application directly in your browser:

👉 **[Launch Live Web App — dhyanlok.vercel.app](https://dhyanlok.vercel.app)**

---

## Why DhyanLok?

Traditional habit trackers often feel like loud, gamified apps that create pressure rather than peace. DhyanLok was created as a quiet digital sanctuary—a space where tracking habits and journaling your thoughts feels peaceful, effortless, and deeply personal.

Instead of cloning code or configuring local databases, you can open the live web app right now to experience:

- **Instant Interactive Sandbox:** Start tracking habits and testing features immediately.
- **AI Voice Journaling:** Dictate your thoughts aloud and let Google Gemini refine your raw speech into polished journal entries (with custom tone selection: *Clean*, *Formal*, *Informal*, or *Casual*).
- **Direct Google Drive Integration:** Sync your audio recordings directly to a `DhyanLok_Log` folder in your personal Google Drive account.
- **Ultra-Focus Mode:** Step into a dark, distraction-free Pomodoro clock with rotating wisdom quotes.
- **DhyanLok AI (`Ctrl + M`):** Speak natural commands to manage habits hands-free.

---

## What You Can Try Live

1. **Habit HQ & Visual Analytics:** Track binary check-offs, set Pomodoro timers, view 365-day activity heatmaps, and monitor category radar trends.
2. **Voice Journaling:** Test natural speech dictation and instant AI transcript cleanup.
3. **Speed Navigation:** Press `Ctrl + K` (or tap the Actions button) anywhere in the app to open the global Command Palette.
4. **Mobile & Desktop:** Fully responsive across mobile phones, tablets, and desktop displays.

---

## Self-Hosting & Local Development

If you prefer to run your own private instance or contribute to the codebase:

### Prerequisites
- Node.js (v18 or higher)
- Supabase account (for cloud database)
- Google Gemini API Key (for AI voice features)

### Quick Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kr-priyanshu/dhyanLok.git
   cd dhyanLok
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create `.env.local` inside `apps/web/`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
   *(Note: You can also enter API keys directly in the web app's Settings panel.)*

4. **Start the local server:**
   ```bash
   cd apps/web
   npm run dev
   ```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS & Glassmorphism Design
- **State Management:** Zustand with offline persistence
- **Database & Auth:** Supabase & SHA-256 Hashing
- **AI & Voice:** Google Gemini Multimodal API
- **Storage:** IndexedDB (`idb-keyval`) & Google Drive REST API

---

## Author

Created by **Priyanshu**.

Experience DhyanLok live: **[dhyanlok.vercel.app](https://dhyanlok.vercel.app)**
