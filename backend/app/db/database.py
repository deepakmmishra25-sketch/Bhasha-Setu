"""
Database session management — async SQLAlchemy with asyncpg.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings


def _make_async_url(url: str) -> str:
    """
    Convert a standard postgres:// URL to asyncpg-compatible form.
    Strips sslmode query param (asyncpg handles SSL separately).
    """
    url = url.replace("postgresql://", "postgresql+asyncpg://")
    url = url.replace("postgres://", "postgresql+asyncpg://")
    # Remove sslmode param — asyncpg does not understand it
    if "?" in url:
        base, params = url.split("?", 1)
        kept = "&".join(
            p for p in params.split("&") if not p.startswith("sslmode")
        )
        url = f"{base}?{kept}" if kept else base
    return url


ASYNC_DATABASE_URL = _make_async_url(settings.DATABASE_URL)

engine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models (added in Milestone 5)."""
    pass


async def get_db() -> AsyncSession:  # type: ignore[return]
    """FastAPI dependency — yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def check_db_connection() -> bool:
    """Verify the database is reachable. Used by the health endpoint."""
    from sqlalchemy import text

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
