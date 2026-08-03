"""
Security headers middleware — Milestone 20.

Adds standard HTTP security headers to every response.
HSTS is only set in production (not in development/test).
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Inject security headers on every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Prevent MIME-type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Disallow framing (clickjacking protection)
        response.headers["X-Frame-Options"] = "DENY"

        # Reflected XSS filter (legacy browsers)
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions — allow mic for STT, block camera and geolocation
        response.headers["Permissions-Policy"] = (
            "camera=(), microphone=(self), geolocation=()"
        )

        # HSTS — only in production (not localhost dev)
        if settings.ENVIRONMENT == "production":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        # Remove server identification headers
        for hdr in ("server", "x-powered-by"):
            if hdr in response.headers:
                del response.headers[hdr]

        return response
