"""Tests — Translation endpoint."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_languages(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/translate/languages", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert "languages" in body
    langs = body["languages"]
    assert "English" in langs
    assert "Hindi" in langs
    assert len(langs) == 13


@pytest.mark.asyncio
async def test_translate_text(client: AsyncClient, auth_headers):
    res = await client.post(
        "/api/v1/translate",
        json={
            "text": "Hello, how are you?",
            "target_language": "Hindi",
            "source_language": "English",
        },
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert "translatedText" in body
    # Either translated or original (if no API key)
    assert len(body["translatedText"]) > 0


@pytest.mark.asyncio
async def test_translate_requires_auth(client: AsyncClient):
    res = await client.post(
        "/api/v1/translate",
        json={"text": "Hello", "target_language": "Hindi"},
    )
    assert res.status_code == 403
