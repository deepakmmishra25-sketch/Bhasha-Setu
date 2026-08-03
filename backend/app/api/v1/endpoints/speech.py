"""Speech endpoints — TTS and STT stubs (Google Cloud or Gemini)."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.api.v1.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/speech", tags=["speech"])


class TTSInput(BaseModel):
    text: str
    language: str = "English"
    voice: str = "female"


class STTResponse(BaseModel):
    transcript: str
    language: str
    confidence: float


# Language to BCP-47 code map
LANG_CODES = {
    "English": "en-IN", "Hindi": "hi-IN", "Tamil": "ta-IN",
    "Telugu": "te-IN", "Kannada": "kn-IN", "Malayalam": "ml-IN",
    "Gujarati": "gu-IN", "Marathi": "mr-IN", "Punjabi": "pa-IN",
    "Bengali": "bn-IN", "Urdu": "ur-IN", "Odia": "or-IN", "Assamese": "as-IN",
}


@router.post("/tts")
async def text_to_speech(
    data: TTSInput,
    _: User = Depends(get_current_active_user),
):
    """Convert text to speech. Returns base64-encoded audio."""
    lang_code = LANG_CODES.get(data.language, "hi-IN")

    # Google Cloud TTS integration placeholder
    # In production: use google-cloud-texttospeech
    return {
        "audioBase64": None,
        "language": data.language,
        "languageCode": lang_code,
        "note": "TTS requires Google Cloud TTS credentials (GOOGLE_CLOUD_CREDENTIALS). Configure to enable audio output.",
    }


@router.post("/stt")
async def speech_to_text(_: User = Depends(get_current_active_user)):
    """Convert speech audio to text. Accepts multipart/form-data with audio file."""
    return {
        "transcript": "",
        "language": "Hindi",
        "confidence": 0.0,
        "note": "STT requires Google Cloud Speech-to-Text credentials. Configure GOOGLE_CLOUD_CREDENTIALS to enable.",
    }


@router.get("/languages")
async def supported_languages(_: User = Depends(get_current_active_user)):
    return {"languages": list(LANG_CODES.keys())}
