import re
from pypdf import PdfReader
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.strip()


def extract_sections(resume_text: str) -> dict:
    """Best-effort section extraction using common resume headings."""
    sections = {
        "skills": "",
        "experience": "",
        "education": "",
        "projects": "",
        "full_text": resume_text,
    }

    patterns = {
        "skills": r"(?i)(skills?|technical skills?|core competencies)(.*?)(?=\n[A-Z]{2,}|\Z)",
        "experience": r"(?i)(experience|work experience|employment)(.*?)(?=\n[A-Z]{2,}|\Z)",
        "education": r"(?i)(education|academic)(.*?)(?=\n[A-Z]{2,}|\Z)",
        "projects": r"(?i)(projects?)(.*?)(?=\n[A-Z]{2,}|\Z)",
    }

    for section, pattern in patterns.items():
        match = re.search(pattern, resume_text, re.DOTALL)
        if match:
            sections[section] = match.group(2).strip()[:1500]

    return sections
