from fastapi import APIRouter, UploadFile, File
import tempfile
import shutil

from app.services.analysis_service import run_analysis

router = APIRouter(
    prefix="/api/analyze",
    tags=["analysis"]
)

@router.post("/upload")
def analyze_uploaded_csv(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        shutil.copyfileobj(file.file, tmp)
        csv_path = tmp.name

    return run_analysis(csv_path)
