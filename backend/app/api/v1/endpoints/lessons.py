"""Lesson and category endpoints — with analytics + notification triggers + caching."""

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.core.cache import cache
from app.db.database import AsyncSessionLocal, get_db
from app.models.analytics import UsageEvent
from app.models.lesson import Category, Lesson, LessonProgress
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["lessons"])


# ── Background task helpers ───────────────────────────────────────────────────

async def _record_lesson_event(user_id: str, event_type: str, language: str) -> None:
    """Record a lesson analytics event in a dedicated session (non-blocking)."""
    async with AsyncSessionLocal() as session:
        try:
            session.add(UsageEvent(
                user_id=user_id,
                event_type=event_type,
                feature="lessons",
                language=language,
            ))
            await session.commit()
        except Exception:
            await session.rollback()


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_user)):
    cached = await cache.get("lessons:categories")
    if cached is not None:
        return cached

    result = await db.execute(select(Category).order_by(Category.sort_order))
    cats = result.scalars().all()
    data = [{"id": c.id, "slug": c.slug, "name": c.name, "nameHindi": c.name_hindi, "icon": c.icon, "color": c.color} for c in cats]
    await cache.set("lessons:categories", data, ttl=3600)  # 1 hour
    return data


@router.get("")
async def list_lessons(
    category_id: int | None = Query(None),
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(Lesson).where(Lesson.is_published == True)  # noqa
    if category_id:
        query = query.where(Lesson.category_id == category_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    lessons = result.scalars().all()

    lesson_ids = [l.id for l in lessons]
    progress_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id.in_(lesson_ids),
        )
    )
    progress_map = {p.lesson_id: p for p in progress_result.scalars().all()}

    return [
        {
            "id": l.id,
            "categoryId": l.category_id,
            "title": l.title,
            "titleHindi": l.title_hindi,
            "description": l.description,
            "content": l.content,
            "level": l.level,
            "durationMinutes": l.duration_minutes,
            "thumbnailUrl": l.thumbnail_url,
            "completed": progress_map[l.id].completed if l.id in progress_map else False,
            "bookmarked": progress_map[l.id].bookmarked if l.id in progress_map else False,
        }
        for l in lessons
    ]


@router.get("/{lesson_id}")
async def get_lesson(
    lesson_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from fastapi import HTTPException
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id, Lesson.is_published == True))  # noqa
    lesson = result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    progress_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = progress_result.scalar_one_or_none()

    # Analytics event recorded after response is returned — non-blocking
    background_tasks.add_task(_record_lesson_event, current_user.id, "lesson_view", current_user.language or "English")

    return {
        "id": lesson.id,
        "categoryId": lesson.category_id,
        "title": lesson.title,
        "titleHindi": lesson.title_hindi,
        "description": lesson.description,
        "content": lesson.content,
        "level": lesson.level,
        "durationMinutes": lesson.duration_minutes,
        "completed": progress.completed if progress else False,
        "bookmarked": progress.bookmarked if progress else False,
    }


@router.post("/{lesson_id}/complete")
async def complete_lesson(
    lesson_id: int,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from datetime import datetime, timezone
    from fastapi import HTTPException

    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id, Lesson.is_published == True))  # noqa
    lesson_obj = result.scalar_one_or_none()
    if not lesson_obj:
        raise HTTPException(status_code=404, detail="Lesson not found")

    # Upsert progress row
    progress_result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = progress_result.scalar_one_or_none()
    completed_at = datetime.now(timezone.utc)
    if progress:
        progress.completed = True
        progress.completed_at = completed_at
    else:
        db.add(
            LessonProgress(
                user_id=current_user.id,
                lesson_id=lesson_id,
                completed=True,
                completed_at=completed_at,
            )
        )

    # First completion notification
    from app.services.notification_service import notify_lesson_complete
    await notify_lesson_complete(db, current_user.id, lesson_obj.title, current_user.language or "English")

    await db.commit()

    # Analytics event recorded after response is committed — non-blocking
    background_tasks.add_task(_record_lesson_event, current_user.id, "lesson_complete", current_user.language or "English")

    return {"completed": True, "lessonId": lesson_id}


@router.post("/{lesson_id}/bookmark")
async def toggle_bookmark(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from fastapi import HTTPException
    from sqlalchemy.dialects.postgresql import insert as pg_insert

    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id, Lesson.is_published == True))  # noqa
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Lesson not found")

    existing = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    prog = existing.scalar_one_or_none()
    new_state = not prog.bookmarked if prog else True

    stmt = pg_insert(LessonProgress).values(
        user_id=current_user.id,
        lesson_id=lesson_id,
        bookmarked=new_state,
    ).on_conflict_do_update(
        index_elements=["user_id", "lesson_id"],
        set_={"bookmarked": new_state},
    )
    await db.execute(stmt)
    await db.commit()
    return {"bookmarked": new_state, "lessonId": lesson_id}
