"""Government scheme endpoints."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.db.database import get_db
from app.models.scheme import Scheme
from app.models.user import User

router = APIRouter(prefix="/schemes", tags=["schemes"])


@router.get("")
async def list_schemes(
    category: str | None = Query(None),
    q: str | None = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
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
    return [
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
