import re
from typing import List
from app.models.schemas import KeywordResult


def extract_keywords(jd: str) -> List[str]:
    """Pull tech keywords and skills from the JD using simple heuristics."""
    # Known tech terms to look for
    tech_pattern = re.compile(
        r'\b(C\+\+|Python|Java|JavaScript|TypeScript|Go|Rust|SQL|NoSQL|'
        r'React|Node\.js|FastAPI|Django|Flask|Spring|'
        r'Docker|Kubernetes|Linux|AWS|GCP|Azure|CI/CD|Git|REST|GraphQL|'
        r'Machine Learning|Deep Learning|AI|LLM|NLP|Computer Vision|'
        r'Sensor Fusion|Networking|Cloud|Microservices|Agile|Scrum|'
        r'TensorFlow|PyTorch|Scikit-learn|BERT|CLIP|OpenCV|'
        r'PostgreSQL|MySQL|MongoDB|Redis|Kafka|gRPC)\b',
        re.IGNORECASE
    )
    found = tech_pattern.findall(jd)
    # Deduplicate preserving order, normalise case
    seen, result = set(), []
    for kw in found:
        key = kw.lower()
        if key not in seen:
            seen.add(key)
            result.append(kw)
    return result


def score_keywords(keywords: List[str], resume_text: str) -> List[KeywordResult]:
    results = []
    resume_lower = resume_text.lower()
    for kw in keywords:
        freq = resume_lower.count(kw.lower())
        results.append(KeywordResult(keyword=kw, present=freq > 0, frequency=freq))
    return sorted(results, key=lambda x: (not x.present, x.keyword))
