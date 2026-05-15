from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..security import get_current_user
from ..models.user import User
from ..models.wallet import (
    WalletTransaction, WalletDeposit, WalletWithdraw,
    WalletTransactionPublic, WalletStats, WalletSummary,
)
from ..models.task_model import DeliveryRequest, RequestStatus

router = APIRouter(prefix="/wallet", tags=["wallet"])


def _to_public(t: WalletTransaction) -> WalletTransactionPublic:
    return WalletTransactionPublic(
        id=t.id,
        label=t.label,
        type=t.type,
        amount=t.amount,
        date=t.created_at.strftime('%d.%m.%Y'),
    )


@router.get("/", response_model=WalletSummary)
def get_wallet(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    txs = session.exec(
        select(WalletTransaction)
        .where(WalletTransaction.user_id == current_user.id)
        .order_by(WalletTransaction.created_at.desc())
        .limit(50)
    ).all()

    delivered = session.exec(
        select(DeliveryRequest).where(
            (DeliveryRequest.sender_id == current_user.id) &
            DeliveryRequest.status.in_([RequestStatus.DELIVERED, RequestStatus.COMPLETED])
        )
    ).all()

    total_spent = sum(t.calculated_price or 0.0 for t in delivered)
    total_deliveries = len(delivered)
    avg_order = total_spent / total_deliveries if total_deliveries > 0 else 0.0

    return WalletSummary(
        balance=current_user.wallet_balance,
        stats=WalletStats(
            total_spent=round(total_spent, 2),
            total_deliveries=total_deliveries,
            avg_order=round(avg_order, 2),
        ),
        transactions=[_to_public(t) for t in txs],
    )


@router.post("/deposit", response_model=dict)
def deposit(
    payload: WalletDeposit,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Geçersiz miktar")
    current_user.wallet_balance = round(current_user.wallet_balance + payload.amount, 2)
    session.add(current_user)
    tx = WalletTransaction(
        user_id=current_user.id,
        label="Bakiye Yükleme",
        type="credit",
        amount=payload.amount,
    )
    session.add(tx)
    session.commit()
    session.refresh(current_user)
    return {"balance": current_user.wallet_balance}


@router.post("/withdraw", response_model=dict)
def withdraw(
    payload: WalletWithdraw,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Geçersiz miktar")
    if current_user.wallet_balance < payload.amount:
        raise HTTPException(status_code=400, detail="Yetersiz bakiye")
    current_user.wallet_balance = round(current_user.wallet_balance - payload.amount, 2)
    session.add(current_user)
    tx = WalletTransaction(
        user_id=current_user.id,
        label="Para Çekme",
        type="debit",
        amount=payload.amount,
    )
    session.add(tx)
    session.commit()
    session.refresh(current_user)
    return {"balance": current_user.wallet_balance}
