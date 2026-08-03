"""API v1 — main router, includes all endpoint routers."""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    admin,
    analytics,
    auth,
    chat,
    dashboard,
    lessons,
    notifications,
    ocr,
    payments,
    schemes,
    speech,
    translate,
    users,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(dashboard.router)
api_router.include_router(chat.router)
api_router.include_router(lessons.router)
api_router.include_router(schemes.router)
api_router.include_router(translate.router)
api_router.include_router(ocr.router)
api_router.include_router(speech.router)
api_router.include_router(notifications.router)
api_router.include_router(admin.router)
api_router.include_router(analytics.router)
api_router.include_router(payments.router)
