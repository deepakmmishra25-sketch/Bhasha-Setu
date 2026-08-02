"""
BhashaSetu AI — FastAPI Application
Milestone 2: Foundation — DB connectivity, health API, CORS, logging, env loading.
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
from app.db.database import check_db_connection

setup_logging()


# ─── Lifespan ──────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        f"🚀 Starting {settings.APP_NAME} v{settings.APP_VERSION} "
        f"[{settings.ENVIRONMENT}]"
    )
    db_ok = await check_db_connection()
    if db_ok:
        logger.info("✅ Database connection verified")
    else:
        logger.warning("⚠️  Database unreachable — check DATABASE_URL")
    yield
    logger.info("🛑 Shutting down")


# ─── App ───────────────────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="India's Multilingual AI Platform for Rural Entrepreneurs",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
    openapi_url="/api/openapi.json" if settings.ENVIRONMENT != "production" else None,
)


# ─── Request timing middleware ─────────────────────────────────────────────
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} ({duration_ms:.1f}ms)"
        )
        return response


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


# ─── Health ────────────────────────────────────────────────────────────────
@app.get("/api/healthz", tags=["health"], summary="Health check")
async def health_check():
    db_ok = await check_db_connection()
    return {
        "status": "ok" if db_ok else "degraded",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected" if db_ok else "unreachable",
    }


# ─── API v1 Router (mounted per milestone) ────────────────────────────────
# from app.api.v1.router import api_router
# app.include_router(api_router, prefix="/api/v1")
