"""Anti-circumvention message moderation.

Users must negotiate through the platform until an admin approves the exchange,
so any attempt to share contact details inside a chat message is masked before
the message is stored. The raw text is preserved separately for admin review
and each detection is recorded as a ``ViolationLog`` entry.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field

MASK = "*" * 8

# Order matters: emails / telegram handles are matched before bare phone
# numbers so an email's digits aren't partially masked as a phone number.
_EMAIL_RE = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
_TELEGRAM_RE = re.compile(r"(?<![\w@])@[A-Za-z0-9_]{4,32}\b")
_URL_RE = re.compile(
    r"\b(?:t\.me|telegram\.me|wa\.me|whatsapp\.com)/\S+", re.IGNORECASE
)
# A phone number: optional +, then 7+ digits possibly separated by spaces,
# dashes, dots or parentheses.
_PHONE_RE = re.compile(r"\+?\d[\d\s().\-]{6,}\d")
# Spelled-out keywords ("whatsapp 87770001122", "telegram: name").
_WHATSAPP_KW_RE = re.compile(r"\bwhats\s?app\b", re.IGNORECASE)
_TELEGRAM_KW_RE = re.compile(r"\btele?gram\b", re.IGNORECASE)


@dataclass
class ModerationResult:
    body: str
    flagged: bool = False
    # List of (kind, original_text) tuples for each detected violation.
    violations: list[tuple[str, str]] = field(default_factory=list)


def sanitize_message(text: str) -> ModerationResult:
    """Mask contact information in ``text``.

    Returns the sanitised body, whether anything was masked, and the list of
    detected violations (kind + matched text) so the caller can log them.
    """
    violations: list[tuple[str, str]] = []
    sanitized = text

    def _replace(pattern: re.Pattern[str], kind: str) -> None:
        nonlocal sanitized
        for match in pattern.findall(sanitized):
            value = match if isinstance(match, str) else match[0]
            violations.append((kind, value))
        sanitized = pattern.sub(MASK, sanitized)

    _replace(_EMAIL_RE, "email")
    _replace(_URL_RE, "url")
    _replace(_TELEGRAM_RE, "telegram")
    _replace(_PHONE_RE, "phone")

    # Keyword detection (flag only — keyword itself is harmless to keep).
    if _WHATSAPP_KW_RE.search(text):
        violations.append(("whatsapp", "whatsapp"))
    if _TELEGRAM_KW_RE.search(text):
        violations.append(("telegram", "telegram"))

    return ModerationResult(
        body=sanitized,
        flagged=len(violations) > 0,
        violations=violations,
    )
