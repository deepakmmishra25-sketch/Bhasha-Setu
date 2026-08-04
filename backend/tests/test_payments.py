"""Tests — Subscription / Payment endpoints."""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_plans(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/payments/plans", headers=auth_headers)
    assert res.status_code == 200
    plans = res.json()
    assert isinstance(plans, list)
    assert len(plans) >= 3  # Free, Basic, Pro
    plan_names = [p["name"] for p in plans]
    assert "Free" in plan_names
    assert "Basic" in plan_names
    assert "Pro" in plan_names


@pytest.mark.asyncio
async def test_get_current_subscription(client: AsyncClient, auth_headers):
    res = await client.get("/api/v1/payments/subscription", headers=auth_headers)
    assert res.status_code == 200
    # New users have no subscription or a free tier
    body = res.json()
    assert "plan" in body or "subscription" in body or body.get("status") in (None, "none", "active")


@pytest.mark.asyncio
async def test_create_order_for_paid_plan(client: AsyncClient, auth_headers):
    plans_res = await client.get("/api/v1/payments/plans", headers=auth_headers)
    paid_plans = [p for p in plans_res.json() if p["priceMonthly"] > 0]
    if not paid_plans:
        pytest.skip("No paid plans available")

    plan_id = paid_plans[0]["id"]
    res = await client.post(
        "/api/v1/payments/create-order",
        json={"plan_id": plan_id, "billing_cycle": "monthly"},
        headers=auth_headers,
    )
    assert res.status_code == 200
    body = res.json()
    assert "orderId" in body
    assert "amount" in body
    assert body["amount"] > 0


@pytest.mark.asyncio
async def test_create_order_free_plan_rejected(client: AsyncClient, auth_headers):
    plans_res = await client.get("/api/v1/payments/plans", headers=auth_headers)
    free_plan = next((p for p in plans_res.json() if p["priceMonthly"] == 0), None)
    if not free_plan:
        pytest.skip("No free plan available")

    res = await client.post(
        "/api/v1/payments/create-order",
        json={"plan_id": free_plan["id"], "billing_cycle": "monthly"},
        headers=auth_headers,
    )
    assert res.status_code == 400


@pytest.mark.asyncio
async def test_payments_requires_auth(client: AsyncClient):
    res = await client.get("/api/v1/payments/plans")
    assert res.status_code == 403
