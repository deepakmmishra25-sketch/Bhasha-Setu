"""Tests — Dashboard summary endpoint."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_summary(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/dashboard/summary", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert "stats" in body
    assert "recentActivity" in body
    stats = body["stats"]
    assert "lessonsCompleted" in stats
    assert "chatSessions" in stats
    assert "totalLessons" in stats


@pytest.mark.asyncio
async def test_dashboard_requires_auth(client: AsyncClient):
    res = await client.get("/api/v1/dashboard/summary")
    assert res.status_code == 403
