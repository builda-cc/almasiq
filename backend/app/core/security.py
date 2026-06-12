"""Password hashing and JWT helpers."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from ..config import settings

# passlib 1.7.4 probes ``bcrypt.__about__.__version__`` which was removed in
# bcrypt 4.1+. Shim it so passlib's version check doesn't log a noisy
# (harmless) error on startup.
try:  # pragma: no cover - environment shim
    import bcrypt as _bcrypt

    if not hasattr(_bcrypt, "__about__"):

        class _About:  # noqa: D401 - tiny shim
            __version__ = getattr(_bcrypt, "__version__", "4.0.0")

        _bcrypt.__about__ = _About  # type: ignore[attr-defined]
except Exception:  # pragma: no cover
    pass

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: str | int, expires_minutes: int | None = None) -> str:
    expire_delta = timedelta(
        minutes=expires_minutes or settings.access_token_expire_minutes
    )
    expire = datetime.now(timezone.utc) + expire_delta
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(
        payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
    )


def decode_access_token(token: str) -> str | None:
    """Return the subject (user id as string) or None if invalid/expired."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        return None
    return payload.get("sub")
