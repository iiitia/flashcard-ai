# ⚡ FlashForge — AI-Powered Spaced Repetition

> Turn any PDF or notes into a smart flashcard deck in seconds. Built with React, Flask, and Groq LLaMA.

![FlashForge](https://img.shields.io/badge/status-live-brightgreen) ![React](https://img.shields.io/badge/React-18-61dafb?logo=react) ![Flask](https://img.shields.io/badge/Flask-3.x-black?logo=flask)

---

## 🌐 Live Links

| | URL |
|---|---|
| **Frontend** | [your-app.vercel.app](https://flashcard-ai-iiitias-projects.vercel.app) |
| **Backend** | [flashcard-ai-o1pt.onrender.com](https://flashcard-ai-o1pt.onrender.com) |
| **Demo Video** | [Watch walkthrough](https://www.loom.com/share/f2532d6d78484b72b4325bd6ba2281f5) |

---

## ✨ What It Does

FlashForge takes any learning material — a PDF chapter, lecture notes, pasted text — and turns it into a study-ready flashcard deck in under 30 seconds. The app then gets smarter the more you use it, using the **SM-2 spaced repetition algorithm** (the same one behind Anki) to show you cards at exactly the right time.

### Core Features

| Feature | Description |
|---|---|
| 📄 **PDF Ingestion** | Upload any PDF — text is extracted and sent to the AI |
| ✍️ **Text Paste** | Paste notes directly and generate cards instantly |
| 🧠 **AI Card Generation** | LLaMA 3.3 70B generates 15–20 deep, varied flashcards |
| 📊 **SM-2 Spaced Repetition** | Cards you struggle with appear more; mastered cards fade |
| 💡 **AI Explanations** | Tap "Explain this" on any card for a plain-English breakdown |
| 🎯 **Quiz Mode** | Multiple-choice quiz with score tracking and history |
| ⏱️ **Timer Mode** | Optional countdown per card to increase recall pressure |
| 🔊 **Text-to-Speech** | Read cards aloud for audio learners |
| 📤 **Anki Export** | Export any deck to CSV for import into Anki |
| 🔐 **Auth** | Register/login with bcrypt-hashed passwords |
| 🌙 **Dark/Light Mode** | Full theme toggle |
| 🔥 **Streak Tracking** | Daily study streaks to build the habit |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** — functional components, hooks throughout
- **React Router v6** — `BrowserRouter` with protected `/dashboard` route
- **No UI library** — all styles are inline React, zero external CSS dependencies

### Backend
- **Flask** — REST API with Flask-CORS
- **Groq API** — LLaMA 3.3 70B for card generation and explanations (free tier)
- **PyMuPDF** — fast, reliable PDF text extraction
- **bcrypt** — password hashing for auth
- **Gunicorn** — production WSGI server

### Deployment
- **Frontend** → Vercel (automatic deploys from GitHub)
- **Backend** → Render (free tier, spun up on first request)

---

## 📁 Project Structure

```
flashcard-ai/
│
├── backend/
│   ├── app.py              # Main Flask API (routes + logic)
│   ├── llm.py              # LLM integration (Groq API)
│   ├── pdf_utils.py        # PDF text extraction
│   ├── check_models.py     # Model validation/testing
│   ├── users.json          # Local user storage (temporary DB)
│   ├── requirements.txt
│   ├── .env
│   ├── venv/
│   └── __pycache__/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js                # Routing + Protected Routes
│   │   ├── auth.js               # Auth helper functions
│   │   ├── CreatePage.jsx        # Create flashcards
│   │   ├── DashboardLayout.jsx   # Dashboard UI wrapper
│   │   ├── DeckContext.jsx       # Global state management
│   │   ├── HomePage.jsx          # Landing page
│   │   ├── StudyPage.jsx         # Flashcard study UI
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── shared.jsx            # Shared UI components
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── index.js
│   │   └── setupTests.js
│   │
│   ├── node_modules/
│   └── .env
│
└── README.md
```

---

## ⚙️ Local Setup

### 1. Clone & set up the backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

Start the server:

```bash
python app.py
# → Running on http://localhost:5000
```

### 2. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm start
# → Running on http://localhost:3000
```

---

## 🚀 Deployment

### Backend → Render

1. Push `backend/` to GitHub
2. New Web Service on [render.com](https://render.com)
3. Set environment variable: `GROQ_API_KEY`
4. Build command: `pip install -r requirements.txt`
5. Start command: `gunicorn app:app`
6. Add `runtime.txt` with contents: `python-3.10.13`

### Frontend → Vercel

1. Push `frontend/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables:

```
REACT_APP_API_URL=https://flashcard-ai-o1pt.onrender.com
CI=false
```

> **Note:** The free Render tier spins down after 15 minutes of inactivity. The first request after a cold start takes ~30 seconds. Consider adding a `/health` ping on a cron if you need instant response for demos.

---

## 🔗 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/health` | Uptime monitor endpoint |
| `POST` | `/register` | Create account `{username, email, password}` |
| `POST` | `/login` | Sign in `{email, password}` |
| `POST` | `/upload` | Multipart PDF → enriched flashcard objects |
| `POST` | `/generate-from-text` | `{text, deckName}` → enriched flashcard objects |
| `POST` | `/explain` | `{question, answer}` → plain-English explanation |
| `POST` | `/search` | `{query, decks}` → deck + card matches |
| `POST` | `/review-schedule` | `{decks, daysAhead}` → cards bucketed by due date |
| `POST` | `/deck-summary` | `{cards}` → 2-3 sentence AI deck description |

All flashcard endpoints return cards pre-enriched with SM-2 fields:

```json
{
  "id": 1,
  "question": "What is the quadratic formula?",
  "answer": "x = (-b ± √(b²-4ac)) / 2a",
  "interval": 1,
  "easeFactor": 2.5,
  "repetitions": 0,
  "nextReview": "2026-04-10",
  "status": "new"
}
```

---

## 🧠 How SM-2 Works

After each card you rate it: **Hard (1)**, **Okay (3)**, or **Easy (5)**. The algorithm adjusts two values:

- **Interval** — days until the card appears again (starts at 1, grows exponentially on correct answers)
- **Ease Factor** — a multiplier (starts at 2.5) that shrinks if you find a card hard and grows if you find it easy

Cards reach **"mastered"** status after 3 consecutive correct reviews. The progress bar on each deck shows the split between mastered (green), learning (yellow), and new (blue) cards.

---

## 🔒 Security

- Passwords hashed with `bcrypt` before storage — plaintext never persisted
- API key kept server-side only — never exposed to the browser
- CORS locked to known frontend origins (`localhost:3000` in dev, `FRONTEND_URL` env var in prod)
- PDF uploads validated by MIME type and capped at 10 MB

---

## 🚧 What I'd Build Next

- **PostgreSQL** — replace `users.json` with a real database for production scale
- **Deck sharing** — shareable links so students can exchange decks
- **Analytics dashboard** — retention curves, forgetting curve visualisations
- **Mobile app** — React Native with offline sync
- **Adaptive difficulty** — dynamically adjust card difficulty based on performance patterns

---

## 👩‍💻 Author

**Shruti** — CSE Undergraduate, IIIT Guwahati

---

## ⭐ Acknowledgements

- [SM-2 algorithm](https://www.supermemo.com/en/articles/sms) by Piotr Wozniak (SuperMemo)
- [PyMuPDF](https://pymupdf.readthedocs.io) for PDF extraction
- The Flask and React communities

---

*Built as a submission for the Cuemath AI Builder Challenge, April 2026.*
