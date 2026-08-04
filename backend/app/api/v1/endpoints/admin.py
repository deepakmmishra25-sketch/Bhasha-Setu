"""Admin endpoints — platform stats, user management."""

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import require_admin
from app.db.database import get_db
from app.models.analytics import UsageEvent
from app.models.chat import ChatSession
from app.models.lesson import Lesson, LessonProgress
from app.models.scheme import Scheme
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


class UserUpdateInput(BaseModel):
    is_active: bool | None = None
    role: str | None = None


@router.get("/stats")
async def platform_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    active_users = (await db.execute(select(func.count()).where(User.is_active == True))).scalar() or 0  # noqa
    total_chats = (await db.execute(select(func.count()).select_from(ChatSession))).scalar() or 0
    total_completions = (await db.execute(select(func.count()).select_from(LessonProgress).where(LessonProgress.completed == True))).scalar() or 0  # noqa
    total_lessons = (await db.execute(select(func.count()).select_from(Lesson))).scalar() or 0
    total_schemes = (await db.execute(select(func.count()).select_from(Scheme))).scalar() or 0
    total_events = (await db.execute(select(func.count()).select_from(UsageEvent))).scalar() or 0

    # Top languages from usage events
    lang_q = await db.execute(
        select(UsageEvent.language, func.count().label("cnt"))
        .where(UsageEvent.language.isnot(None))
        .group_by(UsageEvent.language)
        .order_by(func.count().desc())
        .limit(5)
    )
    top_languages = [{"language": r.language, "count": r.cnt} for r in lang_q.all()]

    return {
        "users": {"total": total_users, "active": active_users},
        "chats": {"total": total_chats},
        "lessons": {"total": total_lessons, "completions": total_completions},
        "schemes": {"total": total_schemes},
        "analytics": {"totalEvents": total_events, "topLanguages": top_languages},
    }


@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    query = select(User)
    if q:
        query = query.where(User.email.ilike(f"%{q}%") | User.name.ilike(f"%{q}%"))
    query = query.offset(skip).limit(limit).order_by(User.created_at.desc())
    result = await db.execute(query)
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "language": u.language,
            "occupation": u.occupation,
            "isActive": u.is_active,
            "createdAt": u.created_at.isoformat(),
        }
        for u in users
    ]


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdateInput,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role is not None:
        if data.role not in ("user", "admin", "moderator"):
            raise HTTPException(status_code=400, detail="Invalid role")
        user.role = data.role

    await db.commit()
    return {"id": user.id, "isActive": user.is_active, "role": user.role}
