"""Tests — Lessons / Knowledge Base endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_lessons(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/lessons", headers=auth_headers)
    assert res.status_code == 200
    lessons = res.json()
    assert isinstance(lessons, list)
    assert len(lessons) > 0  # Seeded lessons should exist


@pytest.mark.asyncio
async def test_list_lessons_by_category(client: AsyncClient, auth_headers):
    # Fetch available categories first
    cats_res = await client.get("/api/v1/lessons/categories", headers=auth_headers)
    assert cats_res.status_code == 200
    categories = cats_res.json()
    assert isinstance(categories, list)

    if categories:
        cat_id = categories[0]["id"]
        res = await client.get(
            f"/api/v1/lessons?category_id={cat_id}", headers=auth_headers
        )
        assert res.status_code == 200


@pytest.mark.asyncio
async def test_get_lesson_detail(client: AsyncClient, auth_headers):
    lessons_res = await client.get("/api/v1/lessons", headers=auth_headers)
    lessons = lessons_res.json()
    assert len(lessons) > 0

    lesson_id = lessons[0]["id"]
    res = await client.get(f"/api/v1/lessons/{lesson_id}", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert "title" in body
    assert "content" in body


@pytest.mark.asyncio
async def test_mark_lesson_complete(client: AsyncClient, auth_headers):
    lessons_res = await client.get("/api/v1/lessons", headers=auth_headers)
    lesson_id = lessons_res.json()[0]["id"]

    res = await client.post(
        f"/api/v1/lessons/{lesson_id}/complete", headers=auth_headers
    )
    assert res.status_code == 200
    assert res.json().get("completed") is True


@pytest.mark.asyncio
async def test_get_nonexistent_lesson(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/lessons/999999", headers=auth_headers)
    assert res.status_code == 404


@pytest.mark.asyncio
async def test_lessons_requires_auth(client: AsyncClient):
    res = await client.get("/api/v1/lessons")
    assert res.status_code == 403
