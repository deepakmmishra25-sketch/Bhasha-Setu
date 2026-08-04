"""Analytics / usage event model."""

from datetime import datetime, timezone

from sqlalchemy import DateTime, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class UsageEvent(Base):
    __tablename__ = "usage_events"
    __table_args__ = (
        # Composite index: analytics_overview queries filter created_at then group by feature
        Index("ix_usage_events_created_feature", "created_at", "feature"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True, index=True)
    event_type: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    # e.g. chat_message, lesson_complete, ocr_extract, translate, scheme_view
    feature: Mapped[str] = mapped_column(String(60), nullable=False, index=True)
    language: Mapped[str | None] = mapped_column(String(30), nullable=True)
    meta: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON string
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
