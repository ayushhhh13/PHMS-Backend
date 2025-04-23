from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from utils.llm_helper import get_answer
from utils.stt import speech_to_text
from utils.tts import synthesize_speech
import shutil

app = FastAPI()

# CORS setup
origins = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConversationHistory(BaseModel):
    history: list

class TTSRequest(BaseModel):
    text: str
    language: str = "en-US"

@app.post("/get-answer")
async def answer(convo: ConversationHistory):
    try:
        response = get_answer(convo.history)
        return {"response": response}
    except Exception as e:
        return {"error": str(e)}

@app.post("/speech-to-text")
async def convert_audio(file: UploadFile = File(...)):
    with open(file.filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    try:
        text = speech_to_text(file.filename)
        return {"transcript": text}
    except Exception as e:
        return {"error": str(e)}

@app.post("/text-to-speech")
async def convert_text(payload: TTSRequest):
    if not payload.text.strip():
        raise HTTPException(status_code=400, detail="Text input is empty")

    audio_stream = synthesize_speech(payload.text, language=payload.language)
    return StreamingResponse(
        audio_stream,
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"},
    )