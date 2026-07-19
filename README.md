# 🧘 DhyanLok (ध्यानलोक) — Your Personal Realm of Mindfulness & Habit Mastery

> **DhyanLok** *(Sanskrit: ध्यान "Meditation/Focus" + लोक "Realm/World")* is a calm, minimalist habit tracker, voice-powered daily journal, and focus sanctuary built to help you build meaningful habits without the noise, clutter, or pressure of traditional apps.

---

## 🌟 Why I Built DhyanLok

Most habit trackers out there feel like bloated spreadsheets or noisy social media apps pushing gamified pressure. I wanted a quiet digital corner — a true **sanctuary** — where tracking your habits feels peaceful, effortless, and deeply personal. 

Whether you want to check off daily micro-habits, dictate your thoughts aloud using AI to clean up messy transcripts, sync your voice logs safely to your own Google Drive, or step into a zero-distraction Pomodoro clock, **DhyanLok** was created to be your daily sanctuary.

---

## ✨ Features at a Glance

### 📊 1. Habit HQ & Visual Analytics
- **Binary & Timer Habits:** Track simple check-off habits or set custom Pomodoro target timers.
- **365-Day Activity Heatmap:** See your daily consistency represented in a beautiful activity grid.
- **Category Radar & Trends:** Measure your growth across Health, Mindset, Learning, and Creativity.
- **Touch-Friendly Drag & Drop:** Reorder habits into categories that fit your daily flow.

### 🎙️ 2. AI Voice Journal & Daily Log
- **Speak Your Thoughts:** Dictate your daily journal entry naturally without typing.
- **AI Transcript Refinement:** Powered by Google Gemini, your raw audio transcript is automatically polished. Choose your tone: **Clean**, **Formal**, **Informal**, or **Casual**.
- **Direct Google Drive Sync:** Sync your audio logs directly into your personal `DhyanLok_Log` Google Drive folder. Your data stays *yours*.

### ⏱️ 3. Ultra-Focus Mode
- **Full-Screen Clock Overlay:** Need deep focus? Launch Ultra-Focus Mode for a dark, ticking Pomodoro timer with rotating wisdom quotes to keep you grounded.

### 🤖 4. DhyanLok AI Voice Assistant
- **Hands-Free Control (`Ctrl + M` / ✨ button):** Just say *"Add a habit to read 20 pages every night"* or *"Remove the meditation habit"*, and DhyanLok handles the rest automatically.

### ⌨️ 5. Speed Navigation
- **Command Palette (`Ctrl + K` / Actions button):** Jump to any page or toggle modes instantly without taking your hands off the keyboard.

### 📱 6. Designed for Mobile & Desktop
- Fully responsive layout with mobile bottom-dock navigation, top-corner settings, and zero horizontal scrolling.

---

## 🚀 Getting Started (Step-by-Step Guide)

You don't need to be a senior software engineer to run DhyanLok on your own computer! Just follow these simple steps:

### Prerequisites
Before starting, make sure you have:
1. [Node.js](https://nodejs.org/) installed on your computer (v18 or higher recommended).
2. A free [Supabase](https://supabase.com) account (for cloud database storage).
3. A free [Google Gemini API Key](https://aistudio.google.com/) (optional, for AI voice features).

---

### 🛠️ Quick Installation

#### 1. Clone the repository
Open your terminal (or Command Prompt) and run:
```bash
git clone https://github.com/kr-priyanshu/dhyanLok.git
cd dhyanLok
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Set up environment variables
Create a file named `.env.local` inside `apps/web/` and add your keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```
*(Note: You can also set your keys directly inside the web app's Settings panel after launching!)*

#### 4. Launch DhyanLok
```bash
cd apps/web
npm run dev
```

Open your browser and head over to **`http://localhost:3000`**. Your sanctuary is ready!

---

## 🛠️ Built With

- **Frontend Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Styling:** TailwindCSS with custom Glassmorphism dark mode system
- **State Management:** [Zustand](https://github.com/pmndrs/zustand) with offline persistence
- **Database & Auth:** [Supabase](https://supabase.com/) & SHA-256 Hashing
- **AI & Voice:** Google Gemini Multimodal API
- **Local Storage:** IndexedDB (`idb-keyval`) for local audio recordings

---

## 🤝 Contributing & Feedback

DhyanLok is an open project born out of a desire for calm productivity. If you have ideas, spot a bug, or want to contribute a feature:

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/CoolFeature`).
3. Commit your changes (`git commit -m 'Add some CoolFeature'`).
4. Push to the branch (`git push origin feature/CoolFeature`).
5. Open a Pull Request!

---

## 💙 A Note from the Creator

> *"You do not rise to the level of your goals. You fall to the level of your systems." — James Clear*

DhyanLok was built to give you a quiet, respectful system. I hope it brings clarity, peace, and focus to your daily routine. 

If DhyanLok helped you stay mindful today, consider giving this repository a ⭐ on GitHub!

---

Made with ❤️ and mindfulness by **Priyanshu**.
