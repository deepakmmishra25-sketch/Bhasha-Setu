"""Tests — health check endpoint."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_ok(client: AsyncClient):
    res = await client.get("/api/healthz")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] in ("ok", "degraded")
    assert "version" in body
    assert "database" in body


@pytest.mark.asyncio
async def test_openapi_docs_available(client: AsyncClient):
    res = await client.get("/api/openapi.json")
    assert res.status_code == 200
    assert "paths" in res.json()
