from fastapi import APIRouter, File, UploadFile, HTTPException
import uvicorn
import os

router = APIRouter()

@router.post("/api/audio/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Save temporary file
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        # Simulated transcription
        text = "Transcription placeholder (connect Whisper API here)"

        return { "text": text }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
