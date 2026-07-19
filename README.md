# DhyanLok (ध्यानलोक)

DhyanLok is a minimalist habit tracker, voice-powered daily journal, and focus sanctuary. It is designed to help you build meaningful habits without the noise, clutter, or gamified pressure of traditional apps.

---

## Origin & Vision

Most habit tracking applications feel like bloated spreadsheets or social media feeds designed to generate anxiety. DhyanLok was created as a quiet digital sanctuary—a space where tracking your habits feels peaceful, effortless, and personal.

Whether you want to check off daily habits, dictate your thoughts using AI to polish your transcripts, sync voice logs to your own Google Drive, or enter a zero-distraction focus clock, DhyanLok gives you a calm system to stay consistent.

---

## Key Features

### Habit HQ & Analytics
- **Binary & Timer Habits:** Track simple check-off habits or set custom Pomodoro target timers.
- **365-Day Activity Heatmap:** Visualize your consistency across an entire year.
- **Category Radar & Trends:** Monitor growth across Health, Mindset, Learning, and Creativity.
- **Drag & Drop:** Reorder habits into categories that fit your workflow.

### Voice Journaling & Refinement
- **Dictation:** Record daily journal entries naturally.
- **AI Transcript Refinement:** Powered by Google Gemini, audio transcripts are polished instantly with your choice of tone: *Clean*, *Formal*, *Informal*, or *Casual*.
- **Google Drive Sync:** Direct REST integration syncs audio logs to a `DhyanLok_Log` folder in your personal Google Drive.

### Focus & Automation
- **Ultra-Focus Mode:** Full-screen Pomodoro timer with rotating wisdom quotes.
- **DhyanLok AI Voice Assistant (`Ctrl + M`):** Hands-free voice commands to add or remove habits.
- **Command Palette (`Ctrl + K`):** Global keyboard navigation across all app pages.

### Mobile & Responsive Design
- Optimized layout with a mobile bottom navigation bar, top-corner settings, and zero horizontal scrolling.

---

## Quickstart Guide

Running DhyanLok locally takes only a few minutes.

### Requirements
- **Node.js:** Version 18 or higher ([Download Node.js](https://nodejs.org/))
- **Supabase Account:** Free database account ([Supabase](https://supabase.com))
- **Google Gemini API Key:** Optional, for AI voice features ([Google AI Studio](https://aistudio.google.com/))

### Installation Steps

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
   Create a `.env.local` file inside `apps/web/`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```
   *Note: You can also enter your API keys directly inside the app's Settings panel.*

4. **Start the Development Server:**
   ```bash
   cd apps/web
   npm run dev
   ```
   Navigate to `http://localhost:3000` in your web browser.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** TailwindCSS with CSS custom properties
- **State Management:** Zustand with offline persistence
- **Database & Auth:** Supabase & SHA-256 Hashing
- **AI Integration:** Google Gemini Multimodal API
- **Local Audio Storage:** IndexedDB (`idb-keyval`)

---

## Contributing

Contributions and feedback are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

---

## Author

Created by **Priyanshu**.
