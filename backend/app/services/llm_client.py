import httpx
import os

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


async def call_groq(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {GROQ_API_KEY}"},
            json={
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def call_openai(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=60.0) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": OPENAI_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def call_llm(prompt: str, use_openai: bool = False) -> tuple[str, str]:
    """Returns (response_text, llm_name). Falls back to OpenAI if Groq fails."""
    if use_openai and OPENAI_API_KEY:
        return await call_openai(prompt), OPENAI_MODEL

    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not set in .env")

    try:
        return await call_groq(prompt), GROQ_MODEL
    except Exception:
        if OPENAI_API_KEY:
            return await call_openai(prompt), f"{OPENAI_MODEL} (fallback)"
        raise RuntimeError("Groq call failed and no OpenAI API key configured.")
