import json
import re
import time
from app.services.llm_client import call_llm
from app.services.keyword_scanner import extract_keywords, score_keywords
from app.models.schemas import MatchResponse, SectionScore, RewriteResponse


ANALYSIS_PROMPT = """You are a senior technical recruiter analyzing how well a resume matches a job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Analyze the match and respond ONLY with valid JSON in exactly this format:
{{
  "overall_score": <0-100>,
  "skills": {{
    "score": <0-100>,
    "matched": ["skill1", "skill2"],
    "missing": ["skill3", "skill4"],
    "suggestions": ["Add X to skills section", "Highlight Y experience"]
  }},
  "experience": {{
    "score": <0-100>,
    "matched": ["relevant experience 1"],
    "missing": ["missing experience 1"],
    "suggestions": ["Rephrase bullet X to mention Y"]
  }},
  "education": {{
    "score": <0-100>,
    "matched": ["degree match"],
    "missing": [],
    "suggestions": []
  }},
  "summary": "2-3 sentence honest assessment of fit",
  "top_suggestions": ["Most important change 1", "Most important change 2", "Most important change 3"]
}}

Be specific, honest, and actionable. Only return JSON, no other text."""


REWRITE_PROMPT = """You are an expert resume writer. Rewrite the following resume bullet point to better match the job description.

ORIGINAL BULLET:
{bullet}

JOB DESCRIPTION:
{job_description}

Rules:
- Keep it one concise bullet point
- Start with a strong action verb
- Include measurable impact if possible
- Use keywords from the JD naturally
- Do not invent facts — only reframe what is already there

Respond ONLY with valid JSON:
{{
  "rewritten": "the improved bullet point",
  "explanation": "1 sentence on what changed and why"
}}"""


def extract_json(raw: str) -> dict:
    match = re.search(r"\{.*\}", raw, re.DOTALL)
    if not match:
        raise ValueError("No JSON found in LLM response")
    return json.loads(match.group())


async def analyze_match(resume_text: str, job_description: str, use_openai: bool) -> MatchResponse:
    prompt = ANALYSIS_PROMPT.format(
        resume_text=resume_text[:3000],
        job_description=job_description[:2000],
    )

    start = time.monotonic()
    raw, llm_used = await call_llm(prompt, use_openai)
    latency_ms = (time.monotonic() - start) * 1000

    data = extract_json(raw)

    def parse_section(key: str) -> SectionScore:
        s = data.get(key, {})
        return SectionScore(
            score=s.get("score", 0),
            matched=s.get("matched", []),
            missing=s.get("missing", []),
            suggestions=s.get("suggestions", []),
        )

    keywords = score_keywords(extract_keywords(job_description), resume_text)

    return MatchResponse(
        overall_score=data.get("overall_score", 0),
        skills=parse_section("skills"),
        experience=parse_section("experience"),
        education=parse_section("education"),
        summary=data.get("summary", ""),
        top_suggestions=data.get("top_suggestions", []),
        keywords=keywords,
        llm_used=llm_used,
        latency_ms=round(latency_ms, 1),
    )


async def rewrite_bullet(bullet: str, job_description: str, use_openai: bool) -> RewriteResponse:
    prompt = REWRITE_PROMPT.format(
        bullet=bullet,
        job_description=job_description[:1500],
    )

    start = time.monotonic()
    raw, llm_used = await call_llm(prompt, use_openai)
    latency_ms = (time.monotonic() - start) * 1000

    data = extract_json(raw)

    return RewriteResponse(
        original=bullet,
        rewritten=data.get("rewritten", bullet),
        explanation=data.get("explanation", ""),
        llm_used=llm_used,
        latency_ms=round(latency_ms, 1),
    )
