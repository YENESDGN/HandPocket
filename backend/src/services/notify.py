"""Notification fan-out abstraction.

In v0.1 this writes a row to the `notifications` table and fires an Expo push
notification when the target user has a registered push token.  Additional
channels (Email, SMS) fan out from here so callers in routers do not change.
"""
import json
import logging
import threading
import urllib.request
from typing import Optional

from sqlmodel import Session

from ..models.notification import Notification, NotificationData, NotificationType

logger = logging.getLogger("handpocket")


def _send_expo_push(push_token: str, title: str, body: str, data: dict | None = None) -> None:
    """Fire-and-forget Expo push. Runs in a daemon thread; never raises."""
    try:
        payload = json.dumps({
            "to": push_token,
            "title": title,
            "body": body,
            "data": data or {},
            "sound": "default",
            "priority": "high",
            "channelId": "default",
        }).encode()
        req = urllib.request.Request(
            "https://exp.host/--/api/v2/push/send",
            data=payload,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req, timeout=5) as resp:
            result = json.loads(resp.read())
            status = (result.get("data") or {}).get("status", "unknown")
            logger.info("expo_push_sent token=%.20s status=%s", push_token, status)
    except Exception as exc:
        logger.warning("expo_push_failed token=%.20s error=%s", push_token, exc)


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

    # Best-effort push — import here to avoid circular import at module load
    try:
        from ..models.user import User  # noqa: PLC0415
        user = session.get(User, user_id)
        if user and user.push_token:
            threading.Thread(
                target=_send_expo_push,
                args=(user.push_token, title, body, data.model_dump() if data else None),
                daemon=True,
            ).start()
    except Exception as exc:
        logger.warning("push_dispatch_failed user_id=%s error=%s", user_id, exc)

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
