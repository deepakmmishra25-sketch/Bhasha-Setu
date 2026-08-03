"""Tests — authentication endpoints."""

import pytest
from httpx import AsyncClient

from .conftest import unique_email


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient, registered_user):
    assert "access_token" in registered_user
    assert "refresh_token" in registered_user


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, registered_user):
    res = await client.post(
        "/api/v1/auth/register",
        json={
            "name": "Duplicate",
            "email": registered_user["email"],
            "password": "Secure@123",
        },
    )
    assert res.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, registered_user):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": "Secure@123"},
    )
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body
    assert "refresh_token" in body


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, registered_user):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": registered_user["email"], "password": "wrongpassword"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_login_unknown_email(client: AsyncClient):
    res = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@bhashasetu-test.com", "password": "whatever"},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_me_authenticated(client: AsyncClient, registered_user, auth_headers):
    res = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == registered_user["email"]


@pytest.mark.asyncio
async def test_me_unauthenticated(client: AsyncClient):
    res = await client.get("/api/v1/auth/me")
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, registered_user):
    res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": registered_user["refresh_token"]},
    )
    assert res.status_code == 200
    assert "access_token" in res.json()


@pytest.mark.asyncio
async def test_refresh_with_access_token_fails(client: AsyncClient, registered_user):
    """Using an access token as a refresh token must be rejected."""
    res = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": registered_user["access_token"]},
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, auth_headers):
    res = await client.post("/api/v1/auth/logout", headers=auth_headers)
    assert res.status_code == 200
