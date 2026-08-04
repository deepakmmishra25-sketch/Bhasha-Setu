"""
BhashaSetu AI — FastAPI Application
Full API: Auth, Chat, Lessons, Schemes, OCR, Translation, Speech, Admin.
"""

import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from loguru import logger

from app.core.config import settings, CORS_ORIGIN_REGEX
from app.core.logging import setup_logging
from app.core.middleware import ResponseTimeMiddleware
from app.core.security_headers import SecurityHeadersMiddleware
from app.db.database import check_db_connection
from app.db.init_db import create_tables, seed_categories, seed_lessons, seed_schemes

setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"🚀 {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]")
    db_ok = await check_db_connection()
    if db_ok:
        logger.info("✅ Database connected")
        await create_tables()
        await seed_categories()
        await seed_lessons()
        await seed_schemes()
    else:
        logger.warning("⚠️  Database unreachable")
    yield
    logger.info("🛑 Shutdown")


app = FastAPI(
    title=settings.APP_NAME,
    description="India's Multilingual AI Platform",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        ms = (time.perf_counter() - start) * 1000
        logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms:.1f}ms)")
        return response


app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ResponseTimeMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=CORS_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/healthz", tags=["health"])
async def health_check():
    from app.core.cache import cache
    db_ok = await check_db_connection()
    cache_status = await cache.health()
    return {
        "status": "ok" if db_ok else "degraded",
        "version": settings.APP_VERSION,
        "database": "connected" if db_ok else "unreachable",
        **cache_status,
    }


from app.api.v1.router import api_router
app.include_router(api_router, prefix="/api/v1")
