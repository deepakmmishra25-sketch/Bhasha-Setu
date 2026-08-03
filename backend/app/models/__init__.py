"""Import all models here so SQLAlchemy registers them with Base.metadata."""

from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.models.lesson import Category, Lesson, LessonProgress
from app.models.scheme import Scheme, Notification
from app.models.analytics import UsageEvent
from app.models.payment import SubscriptionPlan, UserSubscription

__all__ = [
    "User",
    "ChatSession",
    "ChatMessage",
    "Category",
    "Lesson",
    "LessonProgress",
    "Scheme",
    "Notification",
    "UsageEvent",
    "SubscriptionPlan",
    "UserSubscription",
]
