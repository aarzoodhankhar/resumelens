# Resume Job Matcher

AI-powered resume vs job description analyzer. Runs locally with Ollama — no data leaves your machine.

## Features
- Upload PDF resume + paste any job description
- LLM-powered semantic match (not just keyword overlap)
- Section-level scoring: Skills / Experience / Education
- Actionable rewrite suggestions
- OpenAI fallback if Ollama is unavailable
- Latency tracked per request

## Latency Benchmarks (local, M-series Mac)

| Stage         | p50     | p95     |
|---------------|---------|---------|
| PDF parsing   | ~15ms   | ~40ms   |
| LLM analysis  | ~800ms  | ~2.1s   |
| Total E2E     | ~820ms  | ~2.2s   |

*Measured with llama3.2:3b on Apple M-series via Ollama*

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Ollama](https://ollama.com) running locally with `ollama pull llama3.2`

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env .env.local   # edit if needed
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Architecture

```
PDF Resume + Job Description
        ↓
FastAPI (pdf_parser → text extraction)
        ↓
matcher.py (builds structured prompt)
        ↓
llm_client.py → Ollama (llama3.2) or OpenAI fallback
        ↓
JSON response: scores + matched/missing + suggestions
        ↓
React UI (score circles, section cards, action items)
```

## Tech Stack
- **Backend:** Python, FastAPI, pypdf, httpx
- **LLM:** Ollama (local) + OpenAI (fallback)
- **Frontend:** React 18, Vite, Tailwind CSS
