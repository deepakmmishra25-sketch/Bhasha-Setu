"""Translation endpoint — Gemini-powered multilingual translation."""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.v1.dependencies import get_current_active_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/translate", tags=["translation"])

SUPPORTED_LANGUAGES = [
    "English", "Hindi", "Marathi", "Gujarati", "Tamil", "Telugu",
    "Kannada", "Malayalam", "Punjabi", "Bengali", "Urdu", "Odia", "Assamese",
]


class TranslateInput(BaseModel):
    text: str
    target_language: str
    source_language: str = "auto"


@router.post("")
async def translate(
    data: TranslateInput,
    _: User = Depends(get_current_active_user),
):
    if not settings.GEMINI_API_KEY:
        return {"translatedText": data.text, "note": "Gemini API key not configured — returning original text"}

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)

        prompt = (
            f"Translate the following text to {data.target_language}. "
            f"Return ONLY the translated text, no explanations.\n\nText: {data.text}"
        )
        response = model.generate_content(prompt)
        return {"translatedText": response.text.strip(), "targetLanguage": data.target_language}
    except Exception as e:
        return {"translatedText": data.text, "error": str(e)[:200]}


@router.get("/languages")
async def list_languages(_: User = Depends(get_current_active_user)):
    return {"languages": SUPPORTED_LANGUAGES}
