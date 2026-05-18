from datetime import datetime, timezone
from typing import Literal, Optional
import uuid

from sqlalchemy import Column, Index
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


NotificationType = Literal[
    "task_created",
    "task_accepted",
    "task_picked_up",
    "task_delivered",
    "task_verified",
    "task_cancelled",
    "dispute_opened",
    "dispute_resolved",
]


class NotificationData(SQLModel):
    """Structured payload for `Notification.data_json`. Frontend reads `request_id`
    to deep-link the notification row to `/talep/{id}`."""
    request_id: str
    actor_id: Optional[str] = None


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    type: str = Field(index=True)
    title: str
    body: str
    data_json: Optional[dict] = Field(default=None, sa_column=Column(JSONB, nullable=True))
    read_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), index=True
    )

    __table_args__ = (
        Index("ix_notifications_user_read", "user_id", "read_at"),
    )


class NotificationPublic(SQLModel):
    id: str
    user_id: str
    type: str
    title: str
    body: str
    data_json: Optional[dict] = None
    read_at: Optional[datetime] = None
    created_at: datetime


class UnreadCount(SQLModel):
    count: int
