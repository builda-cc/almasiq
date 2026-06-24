from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from ..models import User


class UserPublic(BaseModel):
    """User fields shown on public profiles and as asset owners.

    Private contact channels (``email``, ``phone``, ``whatsapp``,
    ``telegram``, ``address``) are only populated for the user themselves or
    for the counterparty of an admin-approved exchange. ``contact_unlocked``
    tells the client whether those fields are real or hidden so it can render
    the right state ("available after admin approval").

    Do **not** build this directly from the ORM object for other users — use
    :func:`serialize_user` so the gating is applied consistently.
    """

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    avatar_url: str | None = None
    city: str | None = None
    bio: str | None = None
    role: str
    verification_status: str = "unverified"
    created_at: datetime

    # Gated contact fields (None unless the viewer is authorized).
    email: EmailStr | None = None
    phone: str | None = None
    whatsapp: str | None = None
    telegram: str | None = None
    address: str | None = None
    contact_unlocked: bool = False


def serialize_user(user: User, *, contact_visible: bool) -> UserPublic:
    """Build a :class:`UserPublic` honouring contact-privacy rules."""
    return UserPublic(
        id=user.id,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        city=user.city,
        bio=user.bio,
        role=user.role,
        verification_status=user.verification_status,
        created_at=user.created_at,
        email=user.email if contact_visible else None,
        phone=user.phone if contact_visible else None,
        whatsapp=user.whatsapp if contact_visible else None,
        telegram=user.telegram if contact_visible else None,
        address=user.address if contact_visible else None,
        contact_unlocked=contact_visible,
    )


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    whatsapp: str | None = None
    telegram: str | None = None
    address: str | None = None
    avatar_url: str | None = None
    city: str | None = None
    bio: str | None = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class VerificationDecision(BaseModel):
    # unverified | verified | premium
    verification_status: str = Field(pattern="^(unverified|verified|premium)$")
