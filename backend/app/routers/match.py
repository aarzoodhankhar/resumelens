from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from app.services.pdf_parser import extract_text_from_pdf
from app.services.matcher import analyze_match, rewrite_bullet
from app.services.history import save_result, get_history, get_entry, delete_entry
from app.models.schemas import MatchResponse, RewriteResponse, HistoryEntry
from typing import List

router = APIRouter()


@router.post("/match", response_model=MatchResponse)
async def match_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
    use_openai: bool = Form(False),
):
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")

    file_bytes = await resume.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Resume must be under 5MB.")

    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    result = await analyze_match(resume_text, job_description, use_openai)

    # Save to history
    save_result(job_description, result.model_dump())

    return result


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite(
    bullet: str = Form(...),
    job_description: str = Form(...),
    use_openai: bool = Form(False),
):
    if not bullet.strip():
        raise HTTPException(status_code=400, detail="Bullet text is required.")
    return await rewrite_bullet(bullet, job_description, use_openai)


@router.get("/history", response_model=List[HistoryEntry])
def history():
    return get_history()


@router.get("/history/{entry_id}")
def history_detail(entry_id: int):
    entry = get_entry(entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found.")
    return entry


@router.delete("/history/{entry_id}")
def history_delete(entry_id: int):
    delete_entry(entry_id)
    return {"deleted": entry_id}
