# ResumeLens

AI-powered resume vs job description analyzer. Powered by **Groq (Llama 3.3 70B)** — blazing fast, no GPU required.

## Features
- Upload PDF resume + paste any job description (or fetch from URL)
- LLM-powered semantic match scoring — not just keyword overlap
- Section-level scoring: Skills / Experience / Education
- ATS Keyword Scanner with present/missing breakdown
- Animated SVG score rings with skeleton loading
- Resume Insights panel: weakest area, missing keywords, strongest match
- Resume Bullet Rewriter + re-analysis with score delta
- Multi-JD Comparison: compare up to 3 jobs in parallel, ranked by fit
- Match History saved to SQLite (view, reload, delete)
- OpenAI fallback (GPT-4o-mini) if enabled

## Quick Start (local)

### Prerequisites
- Python 3.9+
- Node.js 18+
- [Groq API key](https://console.groq.com) (free)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
# Create backend/.env:
# GROQ_API_KEY=your_key_here
# GROQ_MODEL=llama-3.3-70b-versatile
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → New → Blueprint
2. Connect your GitHub repo (`aarzoodhankhar/resumelens`)
3. Render picks up `render.yaml` automatically
4. Set these environment variables in the Render dashboard:
   - `GROQ_API_KEY` — your Groq key
   - `ALLOWED_ORIGINS` — your Vercel URL, e.g. `https://resumelens.vercel.app`
5. Copy the deployed URL (e.g. `https://resumelens-api.onrender.com`)

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → import `aarzoodhankhar/resumelens`
2. Set **Root Directory** to `frontend`
3. Build command: `npm run build` | Output: `dist`
4. Open `frontend/vercel.json` and replace the destination URL with your actual Render URL
5. Commit and push — Vercel auto-deploys on every push to `main`

---

## Architecture

```
PDF Resume + Job Description
        ↓
FastAPI (/v1/extract → text, /v1/match → analysis)
        ↓
matcher.py (structured JSON prompt)
        ↓
llm_client.py → Groq (llama-3.3-70b) or OpenAI fallback
        ↓
JSON: scores + matched/missing/suggestions + keywords
        ↓
React UI (score rings, keyword scanner, insights, rewriter)
```

## Tech Stack
- **Backend:** Python 3.9, FastAPI, pypdf, httpx, BeautifulSoup4
- **LLM:** Groq (llama-3.3-70b-versatile) + OpenAI GPT-4o-mini fallback
- **Frontend:** React 18, Vite, Tailwind CSS, react-dropzone
- **DB:** SQLite (match history)
- **Deploy:** Render (backend) + Vercel (frontend)
