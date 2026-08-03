"""Admin endpoints — user management, content moderation."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import require_admin
from app.db.database import get_db
from app.models.chat import ChatSession
from app.models.lesson import Lesson, LessonProgress
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats")
async def platform_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    total_users = (await db.execute(select(func.count()).select_from(User))).scalar() or 0
    active_users = (await db.execute(select(func.count()).where(User.is_active == True))).scalar() or 0  # noqa
    total_chats = (await db.execute(select(func.count()).select_from(ChatSession))).scalar() or 0
    total_completions = (await db.execute(select(func.count()).select_from(LessonProgress).where(LessonProgress.completed == True))).scalar() or 0  # noqa

    return {
        "users": {"total": total_users, "active": active_users},
        "chats": {"total": total_chats},
        "lessons": {"completions": total_completions},
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
        {"id": u.id, "name": u.name, "email": u.email, "role": u.role, "language": u.language, "isActive": u.is_active, "createdAt": u.created_at.isoformat()}
        for u in users
    ]
