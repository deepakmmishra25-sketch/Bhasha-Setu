"""Lesson and category endpoints — with analytics + notification triggers."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.db.database import get_db
from app.models.analytics import UsageEvent
from app.models.lesson import Category, Lesson, LessonProgress
from app.models.user import User

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db), _: User = Depends(get_current_active_user)):
    result = await db.execute(select(Category).order_by(Category.sort_order))
    cats = result.scalars().all()
    return [{"id": c.id, "slug": c.slug, "name": c.name, "nameHindi": c.name_hindi, "icon": c.icon, "color": c.color} for c in cats]


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

    # Track view event
    event = UsageEvent(user_id=current_user.id, event_type="lesson_view", feature="lessons", language=current_user.language)
    db.add(event)
    await db.commit()

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
async def mark_complete(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    from datetime import datetime, timezone
    from fastapi import HTTPException

    lesson_result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = lesson_result.scalar_one_or_none()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = result.scalar_one_or_none()
    already_completed = progress and progress.completed

    if not progress:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)
    progress.completed = True
    progress.completed_at = datetime.now(timezone.utc)

    # Track analytics
    event = UsageEvent(user_id=current_user.id, event_type="lesson_complete", feature="lessons", language=current_user.language)
    db.add(event)

    # Notify on first completion of this lesson
    if not already_completed:
        from app.services.notification_service import notify_lesson_complete
        await notify_lesson_complete(db, current_user.id, lesson.title, current_user.language or "English")

    await db.commit()
    return {"message": "Lesson marked as complete"}


@router.post("/{lesson_id}/bookmark")
async def toggle_bookmark(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(
        select(LessonProgress).where(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson_id,
        )
    )
    progress = result.scalar_one_or_none()
    if not progress:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)
    progress.bookmarked = not progress.bookmarked
    await db.commit()
    return {"bookmarked": progress.bookmarked}
