from typing import Optional
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel


class RequestStatus:
    PENDING = "pending"
    ACCEPTED = "accepted"
    PICKED_UP = "picked_up"
    DELIVERED = "delivered"
    COMPLETED = "completed"
    DISPUTED = "disputed"
    CANCELLED = "cancelled"


class DeliveryRequest(SQLModel, table=True):
    __tablename__ = "delivery_requests"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    sender_id: str = Field(foreign_key="users.id", index=True)
    courier_id: Optional[str] = Field(default=None, foreign_key="users.id", index=True)
    package_photo_url: Optional[str] = None
    package_description: str
    pickup_address: str
    delivery_address: str
    distance_km: Optional[float] = None
    estimated_time_mins: Optional[int] = None
    weight_kg: float
    open_time_multiplier: float = Field(default=1.0)
    calculated_price: Optional[float] = None
    status: str = Field(default=RequestStatus.PENDING, index=True)
    delivery_proof_photo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class DeliveryRequestCreate(SQLModel):
    package_description: str
    pickup_address: str
    delivery_address: str
    weight_kg: float
    open_time_multiplier: float = 1.0
    package_photo_url: Optional[str] = None
    distance_km: Optional[float] = None
    estimated_time_mins: Optional[int] = None
    calculated_price: Optional[float] = None


class DeliveryRequestPublic(SQLModel):
    id: str
    sender_id: str
    courier_id: Optional[str]
    package_photo_url: Optional[str]
    package_description: str
    pickup_address: str
    delivery_address: str
    distance_km: Optional[float]
    estimated_time_mins: Optional[int]
    weight_kg: float
    open_time_multiplier: float
    calculated_price: Optional[float]
    status: str
    delivery_proof_photo_url: Optional[str]
    created_at: datetime
    updated_at: datetime


class StatusUpdate(SQLModel):
    status: str
