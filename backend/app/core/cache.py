"""
Redis cache utility — Milestone 19.

Provides a lightweight async cache with:
  - Transparent fallback when Redis is unavailable (no crash, just skip cache)
  - TTL-based key expiry
  - JSON serialisation/deserialisation
  - A `cached` decorator for endpoint functions

Usage in an endpoint:
    from app.core.cache import cache

    @router.get("/lessons")
    async def list_lessons(...):
        cached = await cache.get("lessons:all")
        if cached is not None:
            return cached
        lessons = await _fetch_lessons(db)
        await cache.set("lessons:all", lessons, ttl=300)
        return lessons

Or with the decorator (synchronous-style, wraps coroutine):
    from app.core.cache import cached

    @cached("schemes:list", ttl=300)
    async def _get_schemes(db): ...
"""

import json
import logging
from functools import wraps
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)

# ── Lazy Redis connection ─────────────────────────────────────────────────────
_redis_client = None


async def _get_redis():
    global _redis_client
    if _redis_client is not None:
        return _redis_client
    if not settings.REDIS_URL:
        return None
    try:
        import redis.asyncio as aioredis  # type: ignore[import]
        client = aioredis.from_url(settings.REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        await client.ping()
        _redis_client = client
        logger.info("Redis cache connected")
        return _redis_client
    except Exception as exc:
        logger.warning(f"Redis unavailable — caching disabled: {exc}")
        return None


class Cache:
    """Simple async Redis cache with graceful no-cache fallback."""

    async def get(self, key: str) -> Any | None:
        """Return cached value or None if missing / Redis unavailable."""
        redis = await _get_redis()
        if redis is None:
            return None
        try:
            raw = await redis.get(key)
            if raw is None:
                return None
            return json.loads(raw)
        except Exception as exc:
            logger.debug(f"Cache GET error [{key}]: {exc}")
            return None

    async def set(self, key: str, value: Any, ttl: int = 300) -> bool:
        """Store value as JSON with TTL seconds. Returns True on success."""
        redis = await _get_redis()
        if redis is None:
            return False
        try:
            await redis.setex(key, ttl, json.dumps(value, default=str))
            return True
        except Exception as exc:
            logger.debug(f"Cache SET error [{key}]: {exc}")
            return False

    async def delete(self, key: str) -> bool:
        """Invalidate a specific cache key."""
        redis = await _get_redis()
        if redis is None:
            return False
        try:
            await redis.delete(key)
            return True
        except Exception as exc:
            logger.debug(f"Cache DEL error [{key}]: {exc}")
            return False

    async def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a glob pattern. Returns count deleted."""
        redis = await _get_redis()
        if redis is None:
            return 0
        try:
            keys = await redis.keys(pattern)
            if keys:
                return await redis.delete(*keys)
            return 0
        except Exception as exc:
            logger.debug(f"Cache DEL PATTERN error [{pattern}]: {exc}")
            return 0

    async def health(self) -> dict:
        """Return Redis connection status for health checks."""
        redis = await _get_redis()
        if redis is None:
            return {"redis": "unavailable"}
        try:
            await redis.ping()
            return {"redis": "connected"}
        except Exception:
            return {"redis": "error"}


# ── Global singleton ──────────────────────────────────────────────────────────
cache = Cache()


# ── Decorator helper (for pure functions, not request-scoped endpoints) ───────
def cached(key: str, ttl: int = 300):
    """
    Decorator: cache the return value of an async function under `key`.
    The function must accept no positional args (use for simple queries).
    For parameterised keys, call cache.get/set directly.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            result = await cache.get(key)
            if result is not None:
                return result
            result = await func(*args, **kwargs)
            await cache.set(key, result, ttl=ttl)
            return result
        return wrapper
    return decorator
