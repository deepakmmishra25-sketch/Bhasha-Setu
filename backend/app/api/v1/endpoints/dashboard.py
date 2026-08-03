"""Dashboard summary endpoint."""

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.db.database import get_db
from app.models.lesson import LessonProgress
from app.models.chat import ChatSession
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # Completed lessons count
    completed = await db.execute(
        select(func.count()).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,  # noqa
        )
    )
    completed_count = completed.scalar() or 0

    # Chat sessions count
    chats = await db.execute(
        select(func.count()).where(ChatSession.user_id == current_user.id)
    )
    chat_count = chats.scalar() or 0

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "language": current_user.language,
            "occupation": current_user.occupation,
        },
        "stats": {
            "completedLessons": completed_count,
            "chatSessions": chat_count,
            "schemesViewed": 0,
            "documentsScanned": 0,
        },
        "streakDays": 1,
    }
