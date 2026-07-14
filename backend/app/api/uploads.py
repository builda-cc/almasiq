from __future__ import annotations

import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from ..config import settings
from .deps import get_current_user
from ..models import User

router = APIRouter(prefix="/api/uploads", tags=["uploads"])

ALLOWED_TYPES = {t.strip() for t in settings.allowed_image_types.split(",")}
ALLOWED_ATTACHMENT_TYPES = {
    t.strip() for t in settings.allowed_attachment_types.split(",")
}


@router.post("", status_code=status.HTTP_201_CREATED)
async def upload_image(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type {file.content_type} is not allowed. "
            f"Accepted: {', '.join(ALLOWED_TYPES)}",
        )

    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    data = await file.read()
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File exceeds the {settings.max_upload_size_mb} MB limit.",
        )

    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = os.path.join(settings.upload_dir, str(current_user.id))
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, filename)

    with open(dest_path, "wb") as f:
        f.write(data)

    url = f"/uploads/{current_user.id}/{filename}"

    if settings.backend_public_url:
        url = f"{settings.backend_public_url.rstrip('/')}{url}"

    return {"url": url, "filename": filename}


@router.post("/document", status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> dict[str, str]:
    if file.content_type not in ALLOWED_ATTACHMENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File type {file.content_type} is not allowed. "
            f"Accepted: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT",
        )

    max_bytes = settings.max_attachment_size_mb * 1024 * 1024
    data = await file.read()
    if len(data) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"File exceeds the {settings.max_attachment_size_mb} MB limit.",
        )

    ext = os.path.splitext(file.filename or "")[1].lower() or ".pdf"
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = os.path.join(settings.upload_dir, str(current_user.id))
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, filename)

    with open(dest_path, "wb") as f:
        f.write(data)

    url = f"/uploads/{current_user.id}/{filename}"

    if settings.backend_public_url:
        url = f"{settings.backend_public_url.rstrip('/')}{url}"

    return {"url": url, "filename": file.filename or filename}
