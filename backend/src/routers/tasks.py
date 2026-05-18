import logging
import time
from datetime import datetime
from typing import Any

from cachetools import TTLCache
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, SQLModel, select

from ..database import get_session
from ..models.task_model import (
    DeliveryRequest,
    DeliveryRequestCreate,
    DeliveryRequestPublic,
    RequestStatus,
    StatusUpdate,
)
from ..models.user import User, UserRole
from ..security import get_current_user, require_role
from ..services.notify import safe_notify

limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("handpocket.tasks")

# In-memory TTL cache for open tasks — same result for all couriers, safe to cache briefly.
# TTL=10s: a new pending task becomes visible to couriers within 10 seconds.
_open_tasks_cache: TTLCache = TTLCache(maxsize=1, ttl=10)


class ProofPayload(SQLModel):
    proof_url: str

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Status machine: which transitions are valid and who can trigger them
_TRANSITIONS: dict[str, list[str]] = {
    RequestStatus.ACCEPTED: [RequestStatus.PICKED_UP, RequestStatus.CANCELLED],
    RequestStatus.PICKED_UP: [RequestStatus.DELIVERED],
    RequestStatus.DELIVERED: [RequestStatus.COMPLETED, RequestStatus.DISPUTED],
}


def _credit_courier_for_delivery(session: Session, task: DeliveryRequest) -> None:
    """Credit the assigned courier's wallet with the task's calculated price.
    No-op if courier or price is missing."""
    if not task.courier_id or not task.calculated_price:
        return
    courier = session.get(User, task.courier_id)
    if not courier:
        return
    from ..models.wallet import WalletTransaction
    courier.wallet_balance = round(courier.wallet_balance + task.calculated_price, 2)
    session.add(courier)
    session.add(WalletTransaction(
        user_id=task.courier_id,
        label=f"Teslimat Kazancı — {task.package_description or 'Kargo'}",
        type="credit",
        amount=task.calculated_price,
    ))


def _refund_sender_for_cancellation(session: Session, task: DeliveryRequest) -> None:
    """Refund the task's sender when a task is cancelled. No-op if price missing."""
    if not task.calculated_price:
        return
    sender = session.get(User, task.sender_id)
    if not sender:
        return
    from ..models.wallet import WalletTransaction
    sender.wallet_balance = round(sender.wallet_balance + task.calculated_price, 2)
    session.add(sender)
    session.add(WalletTransaction(
        user_id=task.sender_id,
        label=f"İade — {task.package_description or 'Kargo'}",
        type="credit",
        amount=task.calculated_price,
    ))


@router.post("/", response_model=DeliveryRequestPublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("20/minute")
def create_task(
    request: Request,
    payload: DeliveryRequestCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.SENDER, UserRole.ADMIN)),
):
    price = round(
        (payload.distance_km or 0.0) * payload.weight_kg * payload.open_time_multiplier, 2
    )
    if current_user.wallet_balance < price:
        raise HTTPException(status_code=402, detail="Yetersiz bakiye")

    current_user.wallet_balance = round(current_user.wallet_balance - price, 2)
    session.add(current_user)

    from ..models.wallet import WalletTransaction
    tx = WalletTransaction(
        user_id=current_user.id,
        label=f"Teslimat Ödemesi — {payload.package_description or 'Kargo'}",
        type="debit",
        amount=price,
    )
    session.add(tx)

    task = DeliveryRequest(**payload.model_dump(), sender_id=current_user.id)
    task.calculated_price = price
    session.add(task)
    session.commit()
    session.refresh(task)
    _open_tasks_cache.clear()
    logger.info("task_created task_id=%s sender_id=%s price=%.2f", task.id, current_user.id, price)
    return task


@router.get("/open", response_model=list[DeliveryRequestPublic])
def list_open_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.COURIER, UserRole.ADMIN)),
):
    cached = _open_tasks_cache.get("open")
    if cached is not None:
        return cached
    results = session.exec(
        select(DeliveryRequest).where(DeliveryRequest.status == RequestStatus.PENDING)
    ).all()
    _open_tasks_cache["open"] = results
    return results


@router.get("/my", response_model=list[DeliveryRequestPublic])
def list_my_tasks(
    limit: int = Query(default=200, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.SENDER:
        stmt = select(DeliveryRequest).where(DeliveryRequest.sender_id == current_user.id)
    else:
        stmt = select(DeliveryRequest).where(DeliveryRequest.courier_id == current_user.id)
    stmt = stmt.order_by(DeliveryRequest.created_at.desc()).offset(offset).limit(limit)
    return session.exec(stmt).all()


@router.get("/{task_id}", response_model=DeliveryRequestPublic)
def get_task(
    task_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = session.get(DeliveryRequest, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}/accept", response_model=DeliveryRequestPublic)
def accept_task(
    task_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.COURIER)),
):
    task = session.get(DeliveryRequest, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.status != RequestStatus.PENDING:
        raise HTTPException(status_code=400, detail="Task is no longer available")

    task.courier_id = current_user.id
    task.status = RequestStatus.ACCEPTED
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    _open_tasks_cache.clear()
    safe_notify(
        session, task.sender_id, "task_accepted",
        "Talebiniz kabul edildi", "Kuryeniz yola çıkıyor.",
        request_id=task.id, actor_id=current_user.id,
    )
    return task


@router.patch("/{task_id}/status", response_model=DeliveryRequestPublic)
def update_status(
    task_id: str,
    payload: StatusUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = session.get(DeliveryRequest, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if payload.status not in _TRANSITIONS.get(task.status, []):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot transition from '{task.status}' to '{payload.status}'",
        )

    if payload.status in (RequestStatus.PICKED_UP, RequestStatus.DELIVERED):
        if task.courier_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the assigned courier can advance this status")

    if payload.status == RequestStatus.CANCELLED:
        if current_user.id not in (task.sender_id, task.courier_id):
            raise HTTPException(status_code=403, detail="Only the sender or assigned courier can cancel this task")
        _refund_sender_for_cancellation(session, task)

    if payload.status == RequestStatus.COMPLETED:
        if task.sender_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the sender can confirm completion")
        _credit_courier_for_delivery(session, task)

    task.status = payload.status
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    if payload.status == RequestStatus.PICKED_UP:
        safe_notify(
            session, task.sender_id, "task_picked_up",
            "Kargonuz alındı", "Kuryeniz kargoyu teslim aldı.",
            request_id=task.id, actor_id=current_user.id,
        )
    elif payload.status == RequestStatus.DELIVERED:
        safe_notify(
            session, task.sender_id, "task_delivered",
            "Kargo teslim edildi", "Kanıt fotoğrafını inceleyip teslimatı onaylayabilirsiniz.",
            request_id=task.id, actor_id=current_user.id,
        )
    elif payload.status == RequestStatus.CANCELLED:
        other = task.courier_id if current_user.id == task.sender_id else task.sender_id
        body = (
            "Gönderici teslimatı iptal etti."
            if current_user.id == task.sender_id
            else "Kurye teslimatı iptal etti. Ödemeniz iade edildi."
        )
        safe_notify(
            session, other, "task_cancelled",
            "Teslimat iptal edildi", body,
            request_id=task.id, actor_id=current_user.id,
        )
    elif payload.status == RequestStatus.COMPLETED:
        safe_notify(
            session, task.courier_id, "task_verified",
            "Ödemeniz cüzdanınıza geçti", "Gönderici teslimatı onayladı.",
            request_id=task.id, actor_id=current_user.id,
        )
    return task


@router.patch("/{task_id}/verify", response_model=DeliveryRequestPublic)
def verify_task(
    task_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Sender confirms a delivered task — transitions delivered → completed and credits the courier."""
    task = session.get(DeliveryRequest, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the sender can confirm completion")
    if task.status != RequestStatus.DELIVERED:
        raise HTTPException(status_code=400, detail=f"Cannot verify a task with status '{task.status}'")

    _credit_courier_for_delivery(session, task)

    task.status = RequestStatus.COMPLETED
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    logger.info("task_verified task_id=%s sender_id=%s", task.id, current_user.id)
    safe_notify(
        session, task.courier_id, "task_verified",
        "Ödemeniz cüzdanınıza geçti", "Gönderici teslimatı onayladı.",
        request_id=task.id, actor_id=current_user.id,
    )
    return task


@router.patch("/{task_id}/proof", response_model=DeliveryRequestPublic)
def set_proof_photo(
    task_id: str,
    payload: ProofPayload,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.COURIER)),
):
    task = session.get(DeliveryRequest, task_id)
    if not task or task.courier_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    task.delivery_proof_photo_url = payload.proof_url
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
