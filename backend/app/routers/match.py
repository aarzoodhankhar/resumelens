from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Body
from app.services.pdf_parser import extract_text_from_pdf
from app.services.matcher import analyze_match, rewrite_bullet
from app.services.history import save_result, get_history, get_entry, delete_entry
from app.models.schemas import MatchResponse, RewriteResponse, HistoryEntry, ReanalyzeRequest, ReanalyzeResponse, ScoreDelta, CompareResult, CompareResponse
from typing import List
import asyncio

router = APIRouter()


@router.post("/extract")
async def extract_text(resume: UploadFile = File(...)):
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
    file_bytes = await resume.read()
    text = extract_text_from_pdf(file_bytes)
    return {"text": text}


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


@router.post("/reanalyze", response_model=ReanalyzeResponse)
async def reanalyze(req: ReanalyzeRequest):
    # Inject rewrites into resume text by appending them
    enhanced_text = req.resume_text + "\n\nIMPROVED BULLETS:\n" + "\n".join(f"- {b}" for b in req.rewrites)
    new_result = await analyze_match(enhanced_text, req.job_description, req.use_openai)
    # before score comes from client, we just return the new result + delta
    return ReanalyzeResponse(
        result=new_result,
        delta=ScoreDelta(before=0, after=new_result.overall_score, delta=0),
    )


@router.post("/compare", response_model=CompareResponse)
async def compare_jobs(
    resume: UploadFile = File(...),
    job_descriptions: str = Form(...),  # JSON array of {title, jd} objects
    use_openai: bool = Form(False),
):
    import json as _json
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF resumes are supported.")
    file_bytes = await resume.read()
    resume_text = extract_text_from_pdf(file_bytes)
    if not resume_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from PDF.")

    try:
        jobs = _json.loads(job_descriptions)
    except Exception:
        raise HTTPException(status_code=400, detail="job_descriptions must be a JSON array.")

    if len(jobs) < 2 or len(jobs) > 3:
        raise HTTPException(status_code=400, detail="Provide 2 or 3 job descriptions.")

    # Run all analyses in parallel
    tasks = [analyze_match(resume_text, j["jd"], use_openai) for j in jobs]
    results = await asyncio.gather(*tasks)

    comparison = [
        CompareResult(title=jobs[i]["title"], result=results[i])
        for i in range(len(jobs))
    ]
    # Sort by overall score descending
    comparison.sort(key=lambda x: x.result.overall_score, reverse=True)
    return CompareResponse(comparisons=comparison, best_fit=comparison[0].title)


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
