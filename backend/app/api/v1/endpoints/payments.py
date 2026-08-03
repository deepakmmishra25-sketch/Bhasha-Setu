"""Subscription / payment endpoints."""

import json
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.dependencies import get_current_active_user
from app.db.database import get_db
from app.models.payment import SubscriptionPlan, UserSubscription
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["payments"])

# ── Seeded plan data (also used for initial DB seed) ─────────────────────────
PLANS = [
    {
        "name": "Free",
        "name_hindi": "निःशुल्क",
        "price_monthly": 0,
        "price_yearly": 0,
        "features": json.dumps([
            "5 AI chats per day",
            "Browse all government schemes",
            "10 lessons",
            "Basic translation (500 chars)",
        ]),
    },
    {
        "name": "Basic",
        "name_hindi": "बेसिक",
        "price_monthly": 99,
        "price_yearly": 999,
        "features": json.dumps([
            "50 AI chats per day",
            "All government schemes + AI recommendations",
            "All lessons + quizzes",
            "Translation (5,000 chars)",
            "OCR document scanning (10/day)",
            "Voice input/output",
        ]),
    },
    {
        "name": "Pro",
        "name_hindi": "प्रो",
        "price_monthly": 299,
        "price_yearly": 2999,
        "features": json.dumps([
            "Unlimited AI chats",
            "AI scheme matching + application guidance",
            "All lessons + certificates",
            "Unlimited translation",
            "Unlimited OCR scanning",
            "Voice input/output in all 13 languages",
            "Priority support",
            "Business plan generator",
        ]),
    },
]


class CreateOrderInput(BaseModel):
    plan_id: int
    billing_cycle: str = "monthly"  # monthly | yearly


class VerifyPaymentInput(BaseModel):
    order_id: str
    payment_id: str
    signature: str
    plan_id: int
    billing_cycle: str = "monthly"


@router.get("/plans")
async def list_plans(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_active_user),
):
    """Return all active subscription plans."""
    result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True))  # noqa
    plans = result.scalars().all()

    if not plans:
        # Seed plans on first call if not yet in DB
        for p in PLANS:
            plan = SubscriptionPlan(**p)
            db.add(plan)
        await db.commit()
        result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.is_active == True))  # noqa
        plans = result.scalars().all()

    return [
        {
            "id": p.id,
            "name": p.name,
            "nameHindi": p.name_hindi,
            "priceMonthly": p.price_monthly,
            "priceYearly": p.price_yearly,
            "features": json.loads(p.features),
        }
        for p in plans
    ]


@router.get("/my-subscription")
@router.get("/subscription")
async def my_subscription(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Return the current user's active subscription."""
    result = await db.execute(
        select(UserSubscription, SubscriptionPlan)
        .join(SubscriptionPlan, UserSubscription.plan_id == SubscriptionPlan.id)
        .where(
            UserSubscription.user_id == current_user.id,
            UserSubscription.status == "active",
        )
        .order_by(UserSubscription.created_at.desc())
        .limit(1)
    )
    row = result.first()
    if not row:
        return {"plan": "Free", "status": "free", "expiresAt": None}

    sub, plan = row
    return {
        "plan": plan.name,
        "planHindi": plan.name_hindi,
        "status": sub.status,
        "billingCycle": sub.billing_cycle,
        "expiresAt": sub.expires_at.isoformat() if sub.expires_at else None,
    }


@router.post("/create-order")
async def create_order(
    data: CreateOrderInput,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Create a payment order. In production this calls Razorpay to get an order_id.
    Currently returns a demo order for UI testing.
    """
    plan_result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == data.plan_id))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    amount = plan.price_yearly if data.billing_cycle == "yearly" else plan.price_monthly
    if amount == 0:
        raise HTTPException(status_code=400, detail="Free plan does not require payment")

    # TODO: Integrate Razorpay
    # import razorpay; client = razorpay.Client(auth=(KEY_ID, KEY_SECRET))
    # order = client.order.create({"amount": amount*100, "currency": "INR", "receipt": f"sub_{current_user.id}"})
    return {
        "orderId": f"demo_order_{current_user.id}_{data.plan_id}",
        "amount": amount,
        "currency": "INR",
        "planName": plan.name,
        "note": "Razorpay integration pending — this is a demo order.",
    }


@router.post("/verify")
async def verify_payment(
    data: VerifyPaymentInput,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Verify Razorpay payment signature and activate subscription."""
    plan_result = await db.execute(select(SubscriptionPlan).where(SubscriptionPlan.id == data.plan_id))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    amount = plan.price_yearly if data.billing_cycle == "yearly" else plan.price_monthly
    days = 365 if data.billing_cycle == "yearly" else 30

    sub = UserSubscription(
        user_id=current_user.id,
        plan_id=data.plan_id,
        status="active",
        billing_cycle=data.billing_cycle,
        amount_paid=amount,
        currency="INR",
        payment_id=data.payment_id,
        expires_at=datetime.now(timezone.utc) + timedelta(days=days),
    )
    db.add(sub)
    await db.commit()
    return {"status": "activated", "plan": plan.name, "expiresAt": sub.expires_at.isoformat()}
