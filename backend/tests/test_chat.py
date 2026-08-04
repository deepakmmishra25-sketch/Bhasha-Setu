"""Tests — AI Chat endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_sessions_empty(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/chat/sessions", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_send_message_creates_session(client: AsyncClient, auth_headers):
    res = await client.post(
        "/api/v1/chat/send",
        json={"message": "Hello, what is PM Mudra Yojana?", "language": "English"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert "sessionId" in body
    assert "userMessage" in body
    assert "aiMessage" in body
    assert body["userMessage"]["role"] == "user"
    assert body["aiMessage"]["role"] == "assistant"
    assert len(body["aiMessage"]["content"]) > 0


@pytest.mark.asyncio
async def test_send_message_continues_session(client: AsyncClient, auth_headers):
    # Create session
    res1 = await client.post(
        "/api/v1/chat/send",
        json={"message": "What is PMKVY?", "language": "English"},
        headers=auth_headers,
    )
    assert res1.status_code == 200
    session_id = res1.json()["sessionId"]

    # Continue same session
    res2 = await client.post(
        "/api/v1/chat/send",
        json={"message": "Tell me more", "session_id": session_id, "language": "English"},
        headers=auth_headers,
    )
    assert res2.status_code == 200
    assert res2.json()["sessionId"] == session_id


@pytest.mark.asyncio
async def test_get_session_messages(client: AsyncClient, auth_headers):
    # Create a session with a message
    res = await client.post(
        "/api/v1/chat/send",
        json={"message": "Test message for history", "language": "English"},
        headers=auth_headers,
    )
    session_id = res.json()["sessionId"]

    msgs_res = await client.get(
        f"/api/v1/chat/sessions/{session_id}/messages",
        headers=auth_headers,
    )
    assert msgs_res.status_code == 200
    msgs = msgs_res.json()
    assert len(msgs) >= 2  # user + assistant
    roles = {m["role"] for m in msgs}
    assert "user" in roles
    assert "assistant" in roles


@pytest.mark.asyncio
async def test_sessions_appear_in_list(client: AsyncClient, auth_headers):
    await client.post(
        "/api/v1/chat/send",
        json={"message": "Unique message for listing test", "language": "English"},
        headers=auth_headers,
    )
    res = await client.get("/api/v1/chat/sessions", headers=auth_headers)
    assert res.status_code == 200
    assert len(res.json()) >= 1


@pytest.mark.asyncio
async def test_chat_requires_auth(client: AsyncClient):
    res = await client.post(
        "/api/v1/chat/send",
        json={"message": "hello"},
    )
    assert res.status_code == 403
