<div align="center">
  <img src="https://raw.githubusercontent.com/kr-priyanshu/dhyanLok/master/apps/web/public/icon.svg" width="120" alt="DhyanLok Logo" />
  
  <h1>DhyanLok</h1>
  <p><strong>your calm sanctuary for habits, voice journaling & deep focus</strong> 🧘</p>
  
  <a href="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=18&duration=2600&pause=800&color=E2E8F0&center=true&vCenter=true&width=660&height=42&lines=Track+habits+peacefully+without+clutter+or+pressure;Dictate+daily+journals+%26+let+Gemini+AI+refine+your+voice;Sync+audio+logs+directly+to+your+personal+Google+Drive;Step+into+zero-distraction+Pomodoro+Ultra-Focus+mode">
    <img src="https://readme-typing-svg.demolab.com?font=Inter&weight=600&size=18&duration=2600&pause=800&color=E2E8F0&center=true&vCenter=true&width=660&height=42&lines=Track+habits+peacefully+without+clutter+or+pressure;Dictate+daily+journals+%26+let+Gemini+AI+refine+your+voice;Sync+audio+logs+directly+to+your+personal+Google+Drive;Step+into+zero-distraction+Pomodoro+Ultra-Focus+mode" alt="Typing SVG" />
  </a>

  <br /><br />

  <a href="https://dhyanlok.vercel.app">
    <img src="https://img.shields.io/badge/LIVE_DEMO-Launch_Web_App-101010?style=for-the-badge&logo=vercel&logoColor=white&labelColor=000000" alt="Launch Live Web App" />
  </a>
  <a href="https://github.com/kr-priyanshu/dhyanLok">
    <img src="https://img.shields.io/badge/STATUS-Production_Ready-10B981?style=for-the-badge&labelColor=064E3B" alt="Production Ready" />
  </a>

  <br /><br />
</div>

---

### 🌐 Experience DhyanLok Instantly

No installation, zero friction, and no technical setup required. Click below to experience the full application live in your browser:

<div align="center">

### 👉 **[dhyanlok.vercel.app](https://dhyanlok.vercel.app)** 👈

</div>

---

## ⚙️ How the Sanctuary Works

DhyanLok replaces loud, gamified habit apps with a quiet digital system. Four core pillars power your daily flow:

| Feature | Powered By | Experience Live |
| :--- | :--- | :--- |
| **Habit HQ & Heatmaps** | Next.js 14 & Recharts | Track binary habits, Pomodoro targets, and 365-day activity grids |
| **AI Voice Refinement** | Google Gemini Multimodal | Dictate journal entries & auto-clean transcripts in *Clean*, *Formal*, *Informal*, or *Casual* tones |
| **Google Drive Sync** | REST `multipart/related` API | Sync audio recordings directly to a `DhyanLok_Log` folder in your private Google Drive |
| **DhyanLok AI Assistant** | Gemini 1.5 & Function Schema | Press `Ctrl + M` anywhere to add or remove habits completely hands-free |
| **Ultra-Focus Mode** | Full-Screen Timer Overlay | Launch a dark, ticking Pomodoro timer with rotating wisdom quotes |
| **Speed Navigation** | Command Palette | Press `Ctrl + K` or tap the Actions button to jump between features instantly |

---

## ⚡ Try Live vs. Self-Hosting

| | Live Web App (Recommended) | Self-Hosting (Local Dev) |
| :--- | :---: | :---: |
| **Setup Time** | **Instant (0 sec)** | 5 - 10 minutes |
| **Node.js / Terminal Required** | No | Yes (v18+) |
| **Database Setup** | Pre-configured | Requires Supabase |
| **Access URL** | [dhyanlok.vercel.app](https://dhyanlok.vercel.app) | `localhost:3000` |

---

## 🛠️ Local Development & Self-Hosting

If you prefer to run your own private instance or contribute to the repository:

### Prerequisites
- **Node.js** (v18 or higher)
- **Supabase Account** (for cloud database storage)
- **Google Gemini API Key** (optional, for AI voice features)

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
   Navigate to `http://localhost:3000` in your web browser.

---

## 💙 Author

Created with mindfulness by **Priyanshu**.

Explore the live app: **[dhyanlok.vercel.app](https://dhyanlok.vercel.app)**
