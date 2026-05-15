from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, SQLModel, select
from ..database import get_session
from ..security import get_current_user, require_role
from ..models.task_model import (
    DeliveryRequest,
    DeliveryRequestCreate,
    DeliveryRequestPublic,
    RequestStatus,
    StatusUpdate,
)
from ..models.user import User, UserRole


class ProofPayload(SQLModel):
    proof_url: str

router = APIRouter(prefix="/tasks", tags=["tasks"])

# Status machine: which transitions are valid and who can trigger them
_TRANSITIONS: dict[str, list[str]] = {
    RequestStatus.ACCEPTED: [RequestStatus.PICKED_UP, RequestStatus.CANCELLED],
    RequestStatus.PICKED_UP: [RequestStatus.DELIVERED],
    RequestStatus.DELIVERED: [RequestStatus.COMPLETED, RequestStatus.DISPUTED],
}


@router.post("/", response_model=DeliveryRequestPublic, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: DeliveryRequestCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.SENDER, UserRole.ADMIN)),
):
    price = payload.calculated_price or 0.0
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
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.get("/open", response_model=list[DeliveryRequestPublic])
def list_open_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.COURIER, UserRole.ADMIN)),
):
    return session.exec(
        select(DeliveryRequest).where(DeliveryRequest.status == RequestStatus.PENDING)
    ).all()


@router.get("/my", response_model=list[DeliveryRequestPublic])
def list_my_tasks(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.SENDER:
        stmt = select(DeliveryRequest).where(DeliveryRequest.sender_id == current_user.id)
    else:
        stmt = select(DeliveryRequest).where(DeliveryRequest.courier_id == current_user.id)
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
        # Refund sender when a task is cancelled
        sender = session.get(User, task.sender_id)
        if sender and task.calculated_price:
            sender.wallet_balance = round(sender.wallet_balance + task.calculated_price, 2)
            session.add(sender)
            from ..models.wallet import WalletTransaction
            session.add(WalletTransaction(
                user_id=task.sender_id,
                label=f"İade — {task.package_description or 'Kargo'}",
                type="credit",
                amount=task.calculated_price,
            ))

    if payload.status == RequestStatus.COMPLETED:
        if task.sender_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the sender can confirm completion")
        # Credit the courier's wallet on completion
        if task.courier_id and task.calculated_price:
            courier = session.get(User, task.courier_id)
            if courier:
                courier.wallet_balance = round(courier.wallet_balance + task.calculated_price, 2)
                session.add(courier)
                from ..models.wallet import WalletTransaction
                session.add(WalletTransaction(
                    user_id=task.courier_id,
                    label=f"Teslimat Kazancı — {task.package_description or 'Kargo'}",
                    type="credit",
                    amount=task.calculated_price,
                ))

    task.status = payload.status
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
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
