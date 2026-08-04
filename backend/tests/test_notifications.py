"""Tests — Notification endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_notifications_empty(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/notifications", headers=auth_headers)
    assert res.status_code == 200
    assert isinstance(res.json(), list)


@pytest.mark.asyncio
async def test_first_chat_triggers_notification(client: AsyncClient, auth_headers):
    """Sending a first chat should create a welcome notification."""
    # Send first message
    await client.post(
        "/api/v1/chat/send",
        json={"message": "My first message", "language": "English"},
        headers=auth_headers,
    )
    # Notification should now exist
    res = await client.get("/api/v1/notifications", headers=auth_headers)
    assert res.status_code == 200
    # There should be at least one notification (the first-chat welcome)
    notifs = res.json()
    assert len(notifs) >= 1


@pytest.mark.asyncio
async def test_mark_notification_read(client: AsyncClient, auth_headers):
    # Trigger a notification
    await client.post(
        "/api/v1/chat/send",
        json={"message": "Trigger notification", "language": "English"},
        headers=auth_headers,
    )
    notifs_res = await client.get("/api/v1/notifications", headers=auth_headers)
    notifs = notifs_res.json()
    if not notifs:
        pytest.skip("No notifications to test")

    notif_id = notifs[0]["id"]
    res = await client.post(
        f"/api/v1/notifications/{notif_id}/read",
        headers=auth_headers,
    )
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_mark_all_read(client: AsyncClient, auth_headers):
    res = await client.post("/api/v1/notifications/read-all", headers=auth_headers)
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_notifications_requires_auth(client: AsyncClient):
    res = await client.get("/api/v1/notifications")
    assert res.status_code == 403
