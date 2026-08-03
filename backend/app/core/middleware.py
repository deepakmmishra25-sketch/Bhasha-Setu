"""
Performance middleware — Milestone 19.

ResponseTimeMiddleware adds an X-Response-Time header (in milliseconds) to
every response so clients and Nginx logs can observe backend latency without
parsing server-side log files.
"""

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class ResponseTimeMiddleware(BaseHTTPMiddleware):
    """Inject X-Response-Time: <ms>ms into every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000
        response.headers["X-Response-Time"] = f"{elapsed_ms:.1f}ms"
        return response
