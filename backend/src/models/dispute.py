from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel


class Dispute(SQLModel, table=True):
    __tablename__ = "disputes"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    request_id: str = Field(foreign_key="delivery_requests.id", index=True)
    raised_by: str = Field(foreign_key="users.id")
    reason: str
    resolved: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DisputeCreate(SQLModel):
    request_id: str
    reason: str


class DisputePublic(SQLModel):
    id: str
    request_id: str
    raised_by: str
    reason: str
    resolved: bool
    created_at: datetime
