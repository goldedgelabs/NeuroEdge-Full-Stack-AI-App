# backend-py/app/routes/transcribe.py
from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import whisper
import tempfile

router = APIRouter()
model = whisper.load_model("base")

class Transcription(BaseModel):
    text: str

@router.post("/api/audio/transcribe", response_model=Transcription)
async def transcribe_audio(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name
    
    result = model.transcribe(tmp_path)
    return {"text": result["text"]}
