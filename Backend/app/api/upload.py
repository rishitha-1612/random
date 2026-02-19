import shutil
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException

from app.utils.pipeline import run_pipeline

router = APIRouter()


@router.post("/analyze")
async def analyze_transactions(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")

    temp_filename = f"data/{uuid.uuid4()}.csv"

    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        result = run_pipeline(temp_filename)
        return result
    finally:
        pass  # optionally delete file
