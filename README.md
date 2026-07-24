# ResumeLens

AI-powered resume vs job description analyzer. Powered by **Groq (Llama 3.3 70B)** — blazing fast, no GPU required.

🔗 **Live Demo:** [resumelens-phi.vercel.app](https://resumelens-phi.vercel.app)

---

## Features

- **AI Match Scoring** — semantic match across Skills, Experience, Education (not just keywords)
- **ATS Keyword Scanner** — shows which JD keywords are present/missing in your resume
- **Resume Insights** — identifies your weakest section and exactly what's missing
- **Bullet Rewriter** — rewrites weak resume bullets to match the JD, powered by Groq
- **Score Improvement Loop** — rewrite bullets → re-analyze → see before/after score delta
- **Multi-JD Comparison** — compare up to 3 jobs in parallel, ranked by best fit
- **JD URL Auto-Fetch** — paste a job URL, it scrapes and extracts the description automatically
- **Match History** — all past analyses saved, viewable and reloadable
- **Animated UI** — SVG score rings, skeleton loading, mobile responsive

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, react-dropzone |
| Backend | Python 3.11, FastAPI, pypdf, httpx, BeautifulSoup4 |
| LLM | Groq (llama-3.3-70b-versatile) + OpenAI GPT-4o-mini fallback |
| Database | SQLite (match history) |
| Deploy | Render (backend) + Vercel (frontend) |

---

## Quick Start (local)

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Groq API key](https://console.groq.com) (free tier available)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Create backend/.env
echo "GROQ_API_KEY=your_key_here" > .env
echo "GROQ_MODEL=llama-3.3-70b-versatile" >> .env

uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Architecture

```
PDF Resume + Job Description (or URL)
            ↓
  FastAPI backend (pdf_parser → text)
            ↓
  matcher.py (structured JSON prompt)
            ↓
  Groq API → llama-3.3-70b-versatile
            ↓
  JSON: overall_score, skills, experience,
        education, keywords, suggestions
            ↓
  React UI — score rings, keyword scanner,
             insights panel, bullet rewriter
```

---

## Deployment

### Backend → Render
1. New Web Service → connect `aarzoodhankhar/resumelens`
2. Root Directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Env vars: `GROQ_API_KEY`, `GROQ_MODEL`, `ALLOWED_ORIGINS`

### Frontend → Vercel
1. New Project → import `aarzoodhankhar/resumelens`
2. Root Directory: `frontend`
3. Auto-detected as Vite — just deploy

---

## Project Structure

```
resume-job-matcher/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/match.py       # all API endpoints
│   │   ├── services/
│   │   │   ├── matcher.py         # LLM prompt + parsing
│   │   │   ├── llm_client.py      # Groq + OpenAI client
│   │   │   ├── keyword_scanner.py # ATS regex scanner
│   │   │   ├── pdf_parser.py      # pypdf text extraction
│   │   │   └── history.py         # SQLite CRUD
│   │   └── models/schemas.py      # Pydantic models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/Home.jsx
│   │   └── components/
│   │       ├── ScoreCircle.jsx    # animated SVG ring
│   │       ├── KeywordScanner.jsx
│   │       ├── SectionCard.jsx
│   │       ├── WeakSpotPanel.jsx  # resume insights
│   │       ├── RewritePanel.jsx   # bullet rewriter
│   │       ├── CompareTab.jsx     # multi-JD compare
│   │       ├── HistoryDrawer.jsx
│   │       └── AnalyzingOverlay.jsx
│   └── vercel.json
└── render.yaml
```
