"""Dashboard summary endpoint — Milestone 6."""

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.db.database import get_db
from app.models.chat import ChatSession
from app.models.lesson import Lesson, LessonProgress
from app.models.user import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    # ── Stats ──────────────────────────────────────────────────────────
    completed_q = await db.execute(
        select(func.count()).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,  # noqa: E712
        )
    )
    completed_count: int = completed_q.scalar() or 0

    chats_q = await db.execute(
        select(func.count()).where(ChatSession.user_id == current_user.id)
    )
    chat_count: int = chats_q.scalar() or 0

    total_lessons_q = await db.execute(select(func.count()).select_from(Lesson))
    total_lessons: int = total_lessons_q.scalar() or 0

    # ── Recent activity ────────────────────────────────────────────────
    recent_lessons_q = await db.execute(
        select(LessonProgress, Lesson)
        .join(Lesson, LessonProgress.lesson_id == Lesson.id)
        .where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.completed == True,  # noqa: E712
        )
        .order_by(desc(LessonProgress.completed_at))
        .limit(5)
    )
    recent_lessons = recent_lessons_q.all()

    recent_chats_q = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(desc(ChatSession.updated_at))
        .limit(5)
    )
    recent_chats = recent_chats_q.scalars().all()

    # ── Merge and sort recent activity ────────────────────────────────
    activity: list[dict] = []
    for progress, lesson in recent_lessons:
        activity.append(
            {
                "type": "lesson",
                "title": lesson.title,
                "subtitle": f"Completed · {lesson.level}",
                "timestamp": progress.completed_at.isoformat() if progress.completed_at else None,
            }
        )
    for chat in recent_chats:
        activity.append(
            {
                "type": "chat",
                "title": chat.title,
                "subtitle": f"AI Chat · {chat.language}",
                "timestamp": chat.updated_at.isoformat() if chat.updated_at else None,
            }
        )

    activity.sort(key=lambda x: x["timestamp"] or "", reverse=True)

    # ── Progress ───────────────────────────────────────────────────────
    progress_pct = round((completed_count / total_lessons * 100)) if total_lessons else 0

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "language": current_user.language,
            "occupation": current_user.occupation,
        },
        "stats": {
            "completedLessons": completed_count,
            "lessonsCompleted": completed_count,
            "totalLessons": total_lessons,
            "progressPercent": progress_pct,
            "chatSessions": chat_count,
            "schemesViewed": 0,
            "documentsScanned": 0,
        },
        "streakDays": 1,
        "recentActivity": activity[:6],
    }
