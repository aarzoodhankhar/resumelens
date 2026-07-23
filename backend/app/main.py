from dotenv import load_dotenv
load_dotenv()

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import match
from app.services.history import init_db

app = FastAPI(title="Resume Job Matcher API", version="1.0.0")

# In production, set ALLOWED_ORIGINS env var to your Vercel URL
_raw = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match.router, prefix="/v1")

init_db()


@app.get("/health")
def health():
    return {"status": "ok"}
