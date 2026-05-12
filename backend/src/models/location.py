from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel


class Location(SQLModel, table=True):
    __tablename__ = "locations"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    task_id: str = Field(foreign_key="delivery_requests.id", index=True)
    courier_id: str = Field(foreign_key="users.id")
    latitude: float
    longitude: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class LocationCreate(SQLModel):
    task_id: str
    latitude: float
    longitude: float


class LocationPublic(SQLModel):
    id: str
    task_id: str
    courier_id: str
    latitude: float
    longitude: float
    timestamp: datetime
