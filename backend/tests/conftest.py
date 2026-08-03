"""
Shared pytest fixtures for BhashaSetu AI backend tests.

Strategy: run tests against the live server at http://localhost:8000.
This avoids asyncpg / event-loop conflicts and passlib/bcrypt version
mismatches between the test-runner Python and the uv-managed backend.

All fixtures are function-scoped so each test gets a fresh event loop.
"""

import uuid

import httpx
import pytest
import pytest_asyncio

BASE_URL = "http://localhost:8000"


# ── HTTP client ───────────────────────────────────────────────────────────────
@pytest_asyncio.fixture
async def client() -> httpx.AsyncClient:
    """Fresh async HTTP client per test (avoids event-loop reuse issues)."""
    async with httpx.AsyncClient(base_url=BASE_URL, timeout=30.0) as ac:
        yield ac


# ── Helpers ───────────────────────────────────────────────────────────────────
def unique_email() -> str:
    return f"test_{uuid.uuid4().hex[:12]}@bhashasetu-test.com"


# ── Auth fixtures ─────────────────────────────────────────────────────────────
@pytest_asyncio.fixture
async def registered_user(client: httpx.AsyncClient):
    """Register a fresh user and yield { email, password, access_token, refresh_token }."""
    email = unique_email()
    payload = {
        "name": "Test User",
        "email": email,
        "password": "Secure@123",
        "language": "English",
        "state": "Maharashtra",
        "occupation": "farmer",
    }
    res = await client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201, f"Registration failed ({res.status_code}): {res.text}"
    tokens = res.json()
    yield {"email": email, "password": "Secure@123", **tokens}


@pytest_asyncio.fixture
async def auth_headers(registered_user):
    """Return Authorization headers for the registered test user."""
    return {"Authorization": f"Bearer {registered_user['access_token']}"}
