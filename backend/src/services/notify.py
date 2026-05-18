"""Notification fan-out abstraction.

In v0.1 this only writes a row to the `notifications` table. When FCM/Email/SMS
arrive, they fan out from here so callers in routers do not change.
"""
import logging
from typing import Optional

from sqlmodel import Session

from ..models.notification import Notification, NotificationData, NotificationType

logger = logging.getLogger("handpocket")


def notify(
    session: Session,
    user_id: str,
    type: NotificationType,
    title: str,
    body: str,
    data: Optional[NotificationData] = None,
) -> Notification:
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        data_json=data.model_dump() if data else None,
    )
    session.add(notification)
    session.commit()
    session.refresh(notification)
    logger.info(
        "notification_created id=%s user_id=%s type=%s",
        notification.id,
        user_id,
        type,
    )
    return notification


def safe_notify(
    session: Session,
    user_id: Optional[str],
    type: NotificationType,
    title: str,
    body: str,
    request_id: str,
    actor_id: Optional[str] = None,
) -> None:
    """Best-effort notification — failures are logged and never propagate to the caller.
    Skips silently when user_id is None (e.g. a sender cancels a task before any courier accepted)."""
    if not user_id:
        return
    try:
        notify(
            session,
            user_id,
            type,
            title,
            body,
            NotificationData(request_id=request_id, actor_id=actor_id),
        )
    except Exception as exc:
        logger.warning("notify_failed user_id=%s type=%s error=%s", user_id, type, exc)
