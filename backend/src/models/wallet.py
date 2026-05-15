import uuid
from datetime import datetime
from sqlmodel import Field, SQLModel


class WalletTransaction(SQLModel, table=True):
    __tablename__ = "wallet_transactions"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    label: str
    type: str  # 'credit' | 'debit'
    amount: float
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WalletDeposit(SQLModel):
    amount: float


class WalletWithdraw(SQLModel):
    amount: float


class WalletTransactionPublic(SQLModel):
    id: str
    label: str
    type: str
    amount: float
    date: str


class WalletStats(SQLModel):
    total_spent: float
    total_deliveries: int
    avg_order: float


class WalletSummary(SQLModel):
    balance: float
    stats: WalletStats
    transactions: list[WalletTransactionPublic]
