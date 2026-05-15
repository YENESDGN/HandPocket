import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select

from ..database import get_session
from ..models.task_model import DeliveryRequest, RequestStatus
from ..models.user import User
from ..models.wallet import (
    WalletDeposit,
    WalletStats,
    WalletSummary,
    WalletTransaction,
    WalletTransactionPublic,
    WalletWithdraw,
)
from ..security import get_current_user

router = APIRouter(prefix="/wallet", tags=["wallet"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("handpocket.wallet")

_MAX_DEPOSIT = 10_000.0


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
@limiter.limit("10/minute")
def deposit(
    request: Request,
    payload: WalletDeposit,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if payload.amount <= 0 or payload.amount > _MAX_DEPOSIT:
        raise HTTPException(status_code=400, detail=f"Miktar 0 ile {_MAX_DEPOSIT:.0f} arasında olmalı")
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
    logger.info("deposit user_id=%s amount=%.2f new_balance=%.2f", current_user.id, payload.amount, current_user.wallet_balance)
    return {"balance": current_user.wallet_balance}


@router.post("/withdraw", response_model=dict)
@limiter.limit("10/minute")
def withdraw(
    request: Request,
    payload: WalletWithdraw,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Geçersiz miktar")
    if current_user.wallet_balance < payload.amount:
        logger.warning("withdraw_failed reason=insufficient_balance user_id=%s amount=%.2f balance=%.2f", current_user.id, payload.amount, current_user.wallet_balance)
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
    logger.info("withdraw user_id=%s amount=%.2f new_balance=%.2f", current_user.id, payload.amount, current_user.wallet_balance)
    return {"balance": current_user.wallet_balance}
