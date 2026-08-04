"""User update schemas."""

from pydantic import BaseModel


class ProfileUpdate(BaseModel):
    name: str | None = None
    language: str | None = None
    state: str | None = None
    occupation: str | None = None
    avatar_url: str | None = None
