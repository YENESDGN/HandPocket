from typing import Optional
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel


class Review(SQLModel, table=True):
    __tablename__ = "reviews"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    request_id: str = Field(foreign_key="delivery_requests.id", index=True)
    reviewer_id: str = Field(foreign_key="users.id")
    reviewee_id: str = Field(foreign_key="users.id")
    score: int = Field(ge=1, le=5)
    comment: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ReviewCreate(SQLModel):
    request_id: str
    reviewee_id: str
    score: int
    comment: Optional[str] = None


class ReviewPublic(SQLModel):
    id: str
    request_id: str
    reviewer_id: str
    reviewee_id: str
    score: int
    comment: Optional[str]
    created_at: datetime
