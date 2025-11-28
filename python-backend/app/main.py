# backend-py/app/main.py
from fastapi import FastAPI
from routes.generate import router as generate_router
from routes.transcribe import router as transcribe_router  # if you added transcribe earlier

app = FastAPI()
app.include_router(generate_router)
app.include_router(transcribe_router)
