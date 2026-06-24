"""Helpers for creating in-app notifications.

Centralises notification creation so API handlers stay concise and the
notification ``type`` / wording is consistent across the app.
"""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from ..models import Notification, User


def notify(
    db: Session,
    *,
    user_id: int,
    type: str,
    title: str,
    body: str = "",
) -> Notification:
    """Create (but do not commit) a notification for a single user."""
    notification = Notification(user_id=user_id, type=type, title=title, body=body)
    db.add(notification)
    return notification


def notify_admins(db: Session, *, type: str, title: str, body: str = "") -> None:
    """Create a notification for every admin user (uncommitted)."""
    admin_ids = db.execute(select(User.id).where(User.role == "admin")).scalars().all()
    for admin_id in admin_ids:
        notify(db, user_id=admin_id, type=type, title=title, body=body)
