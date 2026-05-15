from typing import Literal, Optional
from datetime import datetime
from sqlmodel import Field, SQLModel


class UserRole:
    SENDER = "sender"
    COURIER = "courier"
    ADMIN = "admin"


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(primary_key=True)  # Mirrors Supabase auth.users UUID
    full_name: str
    role: str = Field(default=UserRole.SENDER)
    email: str = Field(unique=True, index=True)
    phone_number: Optional[str] = None
    wallet_balance: float = Field(default=0.0)
    average_rating: Optional[float] = None
    is_banned: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(SQLModel):
    id: str  # Supabase auth.users UUID passed from frontend after signUp
    full_name: str
    role: Literal["sender", "courier"]
    email: str
    phone_number: Optional[str] = None


class UserUpdate(SQLModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None


class UserPublic(SQLModel):
    id: str
    full_name: str
    role: str
    email: str
    phone_number: Optional[str]
    wallet_balance: float
    average_rating: Optional[float]
    is_banned: bool
    created_at: datetime


class UserPublicLimited(SQLModel):
    """Returned to other users — excludes wallet_balance and ban status."""
    id: str
    full_name: str
    role: str
    email: str
    phone_number: Optional[str]
    average_rating: Optional[float]
