# 🧠 Amulya AI

> **Your Personal AI Workspace** — Code, create, learn, and get answers — all in one place.

A full-stack AI assistant powered by **NVIDIA NIM** with real-time streaming responses, file analysis, creative generation, and more.

![Amulya AI](https://img.shields.io/badge/Amulya_AI-v1.0.0-blue?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-v18+-green?style=flat-square)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![NVIDIA NIM](https://img.shields.io/badge/NVIDIA-NIM-76B900?style=flat-square&logo=nvidia)

---

## ✨ Features

| Feature | Description |
|---|---|
| 💬 **Smart Chat** | General-purpose AI — answers code, knowledge, creative, and more |
| 🎨 **Imagine Mode** | Creative visual design generation via NVIDIA NIM |
| 📁 **File Analysis** | Upload code files & PDFs for instant AI analysis |
| 🔐 **Auth System** | JWT-based registration & login with user profiles |
| 💾 **Chat History** | Persistent sidebar with search, pin, rename, and delete |
| 🎙️ **Voice Mode** | Voice input and text-to-speech output |
| 📤 **Export** | Export chats as Markdown, PDF, or GitHub Gist |
| ⚡ **Streaming** | Real-time SSE streaming for instant responses |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18 or higher
- **NVIDIA API Key** — get one free at [build.nvidia.com](https://build.nvidia.com)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/amulya-ai.git
cd amulya-ai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Open `.env` and add your NVIDIA API key:

```env
NVIDIA_API_KEY=nvapi-YOUR_KEY_HERE
```

> **Note:** MongoDB is optional. If no `MONGODB_URI` is set, the app auto-starts a local in-memory database.

### 4. Run locally

```bash
npm run dev:all
```

This starts both the Vite frontend (port 3000) and Express backend (port 5000) concurrently.

Open **http://localhost:3000** in your browser.

---

## 🏗️ Project Structure

```
amulya-ai/
├── index.html              # HTML entry point
├── vite.config.js          # Vite build config with code-splitting
├── tailwind.config.js      # Tailwind CSS theme
├── package.json            # Scripts & dependencies
├── .env.example            # Environment template
│
├── src/                    # React frontend
│   ├── main.jsx            # Entry point
│   ├── App.jsx             # Router & providers
│   ├── index.css           # Global styles
│   ├── pages/
│   │   ├── LandingPage.jsx # Marketing landing page
│   │   ├── ChatPage.jsx    # Main chat workspace
│   │   └── AuthPage.jsx    # Login / Register
│   ├── components/
│   │   ├── Sidebar.jsx     # Chat history sidebar
│   │   ├── InputBar.jsx    # Message input with file upload
│   │   ├── MessageBubble.jsx # Message rendering + markdown
│   │   ├── WelcomeScreen.jsx # Empty state
│   │   ├── TopBar.jsx      # Top navigation
│   │   ├── CodeRunner.jsx  # In-browser code execution
│   │   ├── SettingsModal.jsx # User settings
│   │   ├── ExportMenu.jsx  # Chat export options
│   │   ├── ChatArea.jsx    # Message list container
│   │   └── TypingIndicator.jsx
│   ├── hooks/
│   │   ├── useChat.js      # Chat state & streaming logic
│   │   ├── useAuth.jsx     # Auth context & JWT
│   │   ├── useAutoScroll.js
│   │   └── useVoice.js     # Speech synthesis
│   └── utils/
│       ├── streamParser.js # SSE stream parser
│       └── exportChat.js   # PDF/Markdown export
│
└── server/                 # Express backend
    ├── index.js            # Server entry (serves frontend in prod)
    ├── db.js               # MongoDB connection + memory fallback
    ├── middleware/
    │   └── auth.js         # JWT auth middleware
    ├── models/
    │   ├── User.js         # User schema
    │   └── Chat.js         # Chat schema
    ├── routes/
    │   ├── chat.js         # POST /api/chat (streaming)
    │   ├── auth.js         # Register, login, profile
    │   ├── upload.js       # File upload & analysis
    │   ├── imagine.js      # Creative generation
    │   └── gist.js         # GitHub Gist export
    └── services/
        └── ai.js           # NVIDIA NIM API client
```

---

## 🌐 Deployment

### Option A: Render / Railway / Fly.io (Recommended)

These platforms support full-stack Node.js apps out of the box.

1. Push your code to GitHub
2. Connect the repo to your hosting platform
3. Set the following:
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
4. Add your environment variables (`NVIDIA_API_KEY`, `JWT_SECRET`, optionally `MONGODB_URI`)

### Option B: Manual VPS

```bash
git clone https://github.com/YOUR_USERNAME/amulya-ai.git
cd amulya-ai
npm install
npm run build
NODE_ENV=production node server/index.js
```

### Option C: Docker (coming soon)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Login |
| `GET`  | `/api/auth/me` | Get profile |
| `PUT`  | `/api/auth/settings` | Update settings |
| `POST` | `/api/chat` | Streaming chat (SSE) |
| `GET`  | `/api/chat/history` | Chat history |
| `POST` | `/api/upload` | File upload & analysis |
| `POST` | `/api/imagine` | Creative generation |
| `POST` | `/api/gist` | Create GitHub Gist |
| `GET`  | `/api/health` | Health check |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion
- **Backend:** Express.js, Node.js
- **AI:** NVIDIA NIM (OpenAI-compatible API)
- **Database:** MongoDB (Atlas or local memory server)
- **Auth:** JWT with bcrypt password hashing

---

## 📄 License

MIT © Amulya AI
