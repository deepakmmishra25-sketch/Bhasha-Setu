"""
Application configuration — all values loaded from OS environment.
Replit injects DATABASE_URL, PGHOST, etc. at runtime; no .env file needed.
"""

import os
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Read from OS env only — Replit injects DATABASE_URL at runtime.
        # A local .env file is optional (picked up automatically if present).
        env_file=None,
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ────────────────────────────────────────────────────────────
    APP_NAME: str = "BhashaSetu AI"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    PORT: int = 8000

    # ── Database (injected by Replit runtime) ──────────────────────────
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/bhashasetu"

    # ── Redis ──────────────────────────────────────────────────────────
    REDIS_URL: str = "redis://localhost:6379/0"

    # ── Auth ───────────────────────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── AI ─────────────────────────────────────────────────────────────
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"

    # ── Logging ────────────────────────────────────────────────────────
    LOG_LEVEL: str = "INFO"

    # ── CORS (static origins) ─────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://localhost:3000",
    ]


settings = Settings()

# Replit wildcard CORS — applied via allow_origin_regex in main.py
CORS_ORIGIN_REGEX = r"https://.*\.(replit\.dev|replit\.app)$"
