"""OCR endpoint — extract text from uploaded documents using Gemini Vision."""

import base64

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.api.v1.dependencies import get_current_active_user
from app.core.config import settings
from app.models.user import User

router = APIRouter(prefix="/ocr", tags=["ocr"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"}
MAX_SIZE_MB = 10


@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    language: str = "English",
    _: User = Depends(get_current_active_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")

    content = await file.read()
    if len(content) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large (max {MAX_SIZE_MB}MB)")

    if not settings.GEMINI_API_KEY:
        return {
            "extractedText": "OCR requires Gemini API key. Please configure GEMINI_API_KEY.",
            "language": language,
            "confidence": 0,
        }

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel("gemini-2.0-flash")

        b64 = base64.b64encode(content).decode()
        mime = file.content_type or "image/jpeg"

        prompt = (
            f"Extract all text from this document/image. "
            f"Translate it to {language} if it is in a different language. "
            f"Return only the extracted text, preserving structure as much as possible."
        )

        response = model.generate_content([
            {"mime_type": mime, "data": b64},
            prompt,
        ])
        return {
            "extractedText": response.text.strip(),
            "language": language,
            "confidence": 0.95,
            "fileName": file.filename,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR failed: {str(e)[:200]}")
