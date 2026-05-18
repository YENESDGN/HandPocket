from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import delete, func, update
from sqlmodel import Session, select

from ..database import get_session
from ..models.notification import Notification, NotificationPublic, UnreadCount
from ..models.user import User, UserRole
from ..security import get_current_user, require_role

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("/", response_model=list[NotificationPublic])
@limiter.limit("30/minute")
def list_notifications(
    request: Request,
    limit: int = Query(default=50, ge=1, le=200),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(limit)
    )
    return session.exec(stmt).all()


@router.get("/unread-count", response_model=UnreadCount)
@limiter.limit("120/minute")
def unread_count(
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stmt = select(func.count()).select_from(Notification).where(
        Notification.user_id == current_user.id,
        Notification.read_at.is_(None),
    )
    count = session.exec(stmt).one()
    return UnreadCount(count=int(count))


@router.patch("/{notification_id}/read", response_model=NotificationPublic)
@limiter.limit("60/minute")
def mark_read(
    request: Request,
    notification_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    notification = session.get(Notification, notification_id)
    if not notification or notification.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Notification not found")
    if notification.read_at is None:
        notification.read_at = datetime.now(timezone.utc)
        session.add(notification)
        session.commit()
        session.refresh(notification)
    return notification


@router.post("/read-all")
@limiter.limit("10/minute")
def mark_all_read(
    request: Request,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    now = datetime.now(timezone.utc)
    stmt = (
        update(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.read_at.is_(None),
        )
        .values(read_at=now)
    )
    result = session.exec(stmt)
    session.commit()
    return {"updated": result.rowcount or 0}


@router.delete("/purge", status_code=200)
def purge_old_read(
    older_than_days: int = Query(default=30, ge=1, le=365),
    session: Session = Depends(get_session),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    """Admin-only retention sweep: delete already-read notifications older than N days.
    Intended to be invoked by a cron job once Alembic + scheduler are wired."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    stmt = delete(Notification).where(
        Notification.read_at.is_not(None),
        Notification.created_at < cutoff,
    )
    result = session.exec(stmt)
    session.commit()
    return {"deleted": result.rowcount or 0}
