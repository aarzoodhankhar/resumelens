from __future__ import annotations
from pydantic import BaseModel
from typing import List, Optional


class MatchRequest(BaseModel):
    job_description: str
    use_openai: bool = False


class SectionScore(BaseModel):
    score: int
    matched: List[str]
    missing: List[str]
    suggestions: List[str]


class KeywordResult(BaseModel):
    keyword: str
    present: bool
    frequency: int  # how many times it appears in resume


class MatchResponse(BaseModel):
    overall_score: int
    skills: SectionScore
    experience: SectionScore
    education: SectionScore
    summary: str
    top_suggestions: List[str]
    keywords: List[KeywordResult]
    llm_used: str
    latency_ms: float


class RewriteRequest(BaseModel):
    bullet: str
    job_description: str
    use_openai: bool = False


class RewriteResponse(BaseModel):
    original: str
    rewritten: str
    explanation: str
    llm_used: str
    latency_ms: float


class HistoryEntry(BaseModel):
    id: int
    job_title: str
    overall_score: int
    skills_score: int
    experience_score: int
    education_score: int
    summary: str
    created_at: str
