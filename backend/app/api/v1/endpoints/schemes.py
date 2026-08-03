"""Government scheme endpoints + AI-powered recommendation."""

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.core.cache import cache
from app.core.config import settings
from app.db.database import get_db
from app.models.scheme import Scheme
from app.models.user import User

router = APIRouter(prefix="/schemes", tags=["schemes"])


class RecommendInput(BaseModel):
    query: str
    language: str = "English"


@router.get("")
async def list_schemes(
    category: str | None = Query(None),
    q: str | None = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    # Cache unfiltered first-page results (most common call)
    cache_key = f"schemes:list:{category or 'all'}:{skip}:{limit}" if not q else None
    if cache_key:
        cached = await cache.get(cache_key)
        if cached is not None:
            return cached

    query = select(Scheme).where(Scheme.is_active == True)  # noqa
    if category:
        query = query.where(Scheme.category == category)
    if q:
        query = query.where(
            or_(
                Scheme.name.ilike(f"%{q}%"),
                Scheme.description.ilike(f"%{q}%"),
                Scheme.target_audience.ilike(f"%{q}%"),
            )
        )
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    schemes = result.scalars().all()
    data = [
        {
            "id": s.id,
            "name": s.name,
            "nameHindi": s.name_hindi,
            "category": s.category,
            "ministry": s.ministry,
            "description": s.description,
            "eligibility": s.eligibility,
            "benefits": s.benefits,
            "websiteUrl": s.website_url,
            "targetAudience": s.target_audience,
        }
        for s in schemes
    ]
    if cache_key:
        await cache.set(cache_key, data, ttl=600)  # 10 min — schemes rarely change
    return data


@router.get("/{scheme_id}")
async def get_scheme(
    scheme_id: int,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    result = await db.execute(select(Scheme).where(Scheme.id == scheme_id))
    scheme = result.scalar_one_or_none()
    if not scheme:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Scheme not found")
    import json
    return {
        "id": scheme.id,
        "name": scheme.name,
        "nameHindi": scheme.name_hindi,
        "category": scheme.category,
        "ministry": scheme.ministry,
        "description": scheme.description,
        "eligibility": scheme.eligibility,
        "benefits": scheme.benefits,
        "documentsRequired": json.loads(scheme.documents_required or "[]"),
        "applicationProcess": scheme.application_process,
        "websiteUrl": scheme.website_url,
        "targetAudience": scheme.target_audience,
    }


@router.post("/recommend")
async def ai_recommend(
    data: RecommendInput,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """AI-powered scheme recommendation based on natural language query."""
    # Fetch all active schemes to give Gemini context
    result = await db.execute(select(Scheme).where(Scheme.is_active == True))  # noqa
    all_schemes = result.scalars().all()

    if not all_schemes:
        return {"schemes": [], "aiSummary": "No schemes available in the database."}

    if not settings.GEMINI_API_KEY:
        # Fallback: keyword-based search
        q = data.query.lower()
        matches = [s for s in all_schemes if q in s.name.lower() or q in s.description.lower() or q in (s.target_audience or "").lower()]
        return {
            "schemes": [{"id": s.id, "name": s.name, "description": s.description, "benefits": s.benefits} for s in matches[:3]],
            "aiSummary": "AI recommendations require Gemini API key.",
        }

    # Build scheme catalogue for the prompt
    catalogue = "\n".join(
        f"{i+1}. {s.name} | Category: {s.category} | Eligibility: {s.eligibility} | Benefits: {s.benefits}"
        for i, s in enumerate(all_schemes)
    )

    prompt = f"""You are a government scheme advisor for rural Indian entrepreneurs.

User query (in {data.language}): {data.query}
User profile: {current_user.occupation or "entrepreneur"}, language preference: {current_user.language or "Hindi"}

Available government schemes:
{catalogue}

Task:
1. Select the 1-3 most relevant scheme numbers for this user's query.
2. Explain in {data.language} why each scheme is relevant to them in 1-2 sentences.
3. Return ONLY a JSON object with this exact structure:
{{"recommendations": [{{"scheme_number": 1, "reason": "..."}}], "summary": "Brief overall guidance in {data.language}"}}

Return ONLY the JSON, no other text."""

    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        model = genai.GenerativeModel(settings.GEMINI_MODEL)
        response = model.generate_content(prompt)
        raw = response.text.strip()

        # Parse JSON from response
        import json, re
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        if json_match:
            parsed = json.loads(json_match.group())
            recs = parsed.get("recommendations", [])
            summary = parsed.get("summary", "")

            recommended = []
            for rec in recs:
                idx = rec.get("scheme_number", 0) - 1
                if 0 <= idx < len(all_schemes):
                    s = all_schemes[idx]
                    recommended.append({
                        "id": s.id,
                        "name": s.name,
                        "nameHindi": s.name_hindi,
                        "category": s.category,
                        "description": s.description,
                        "benefits": s.benefits,
                        "eligibility": s.eligibility,
                        "websiteUrl": s.website_url,
                        "reason": rec.get("reason", ""),
                    })

            return {"schemes": recommended, "aiSummary": summary}
    except Exception as e:
        pass

    # Fallback to keyword search
    q = data.query.lower()
    matches = [s for s in all_schemes if q in s.name.lower() or q in s.description.lower()][:3]
    return {
        "schemes": [{"id": s.id, "name": s.name, "description": s.description, "benefits": s.benefits} for s in matches],
        "aiSummary": "",
    }
