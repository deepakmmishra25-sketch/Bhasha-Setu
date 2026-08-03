"""Import all models here so SQLAlchemy registers them with Base.metadata."""

from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.lesson import Category, Lesson, LessonProgress
from app.models.scheme import Scheme, Notification

__all__ = [
    "User",
    "ChatSession",
    "ChatMessage",
    "Category",
    "Lesson",
    "LessonProgress",
    "Scheme",
    "Notification",
]
