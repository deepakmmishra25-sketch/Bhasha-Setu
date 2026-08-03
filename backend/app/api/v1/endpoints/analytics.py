"""Analytics endpoints — track and query usage events."""

import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user, require_admin
from app.db.database import get_db
from app.models.analytics import UsageEvent
from app.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])


class TrackEventInput(BaseModel):
    event_type: str
    feature: str
    language: str | None = None
    meta: dict | None = None


@router.post("/track")
async def track_event(
    data: TrackEventInput,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Record a usage event for the current user."""
    event = UsageEvent(
        user_id=current_user.id,
        event_type=data.event_type,
        feature=data.feature,
        language=data.language or current_user.language,
        meta=json.dumps(data.meta) if data.meta else None,
    )
    db.add(event)
    await db.commit()
    return {"status": "tracked"}


@router.get("/overview")
async def analytics_overview(
    days: int = 30,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    """Admin overview: event counts by feature for the past N days."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    feature_counts_q = await db.execute(
        select(UsageEvent.feature, func.count().label("cnt"))
        .where(UsageEvent.created_at >= since)
        .group_by(UsageEvent.feature)
        .order_by(func.count().desc())
    )
    feature_counts = [{"feature": r.feature, "count": r.cnt} for r in feature_counts_q.all()]

    language_counts_q = await db.execute(
        select(UsageEvent.language, func.count().label("cnt"))
        .where(UsageEvent.created_at >= since, UsageEvent.language.isnot(None))
        .group_by(UsageEvent.language)
        .order_by(func.count().desc())
    )
    language_counts = [{"language": r.language, "count": r.cnt} for r in language_counts_q.all()]

    total_q = await db.execute(
        select(func.count()).where(UsageEvent.created_at >= since)
    )
    total = total_q.scalar() or 0

    return {
        "periodDays": days,
        "totalEvents": total,
        "byFeature": feature_counts,
        "byLanguage": language_counts,
    }
