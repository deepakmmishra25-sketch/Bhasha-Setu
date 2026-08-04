"""Auth request / response schemas."""

from pydantic import BaseModel, EmailStr, field_validator


class RegisterInput(BaseModel):
    name: str
    email: EmailStr
    password: str
    language: str = "English"
    state: str | None = None
    occupation: str | None = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Name cannot be empty")
        return v.strip()


class LoginInput(BaseModel):
    email: EmailStr
    password: str


class RefreshInput(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str
    language: str
    state: str | None
    occupation: str | None
    avatar_url: str | None
    is_active: bool
    is_verified: bool

    model_config = {"from_attributes": True}
