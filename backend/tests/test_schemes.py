"""Tests — Government Scheme AI endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_schemes(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/schemes", headers=auth_headers)
    assert res.status_code == 200
    schemes = res.json()
    assert isinstance(schemes, list)
    assert len(schemes) > 0  # Seeded schemes should exist


@pytest.mark.asyncio
async def test_list_schemes_filter_by_category(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/schemes?category=farming", headers=auth_headers)
    assert res.status_code == 200
    schemes = res.json()
    assert isinstance(schemes, list)
    for s in schemes:
        assert s["category"] == "farming"


@pytest.mark.asyncio
async def test_search_schemes(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/schemes?q=mudra", headers=auth_headers)
    assert res.status_code == 200
    schemes = res.json()
    assert isinstance(schemes, list)
    assert len(schemes) > 0


@pytest.mark.asyncio
async def test_get_scheme_detail(client: AsyncClient, auth_headers):
    schemes_res = await client.get("/api/v1/schemes", headers=auth_headers)
    schemes = schemes_res.json()
    assert len(schemes) > 0

    scheme_id = schemes[0]["id"]
    res = await client.get(f"/api/v1/schemes/{scheme_id}", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert "name" in body
    assert "description" in body
    assert "eligibility" in body


@pytest.mark.asyncio
async def test_get_nonexistent_scheme(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/schemes/999999", headers=auth_headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_ai_recommend_schemes(client: AsyncClient, auth_headers):
    res = await client.post(
        "/api/v1/schemes/recommend",
        json={"query": "I am a farmer looking for crop insurance", "language": "English"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert "schemes" in body


@pytest.mark.asyncio
async def test_schemes_requires_auth(client: AsyncClient):
    res = await client.get("/api/v1/schemes")
    assert res.status_code == 403
