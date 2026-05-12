from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..database import get_session
from ..security import get_current_user, require_role
from ..models.dispute import Dispute, DisputeCreate, DisputePublic
from ..models.task_model import DeliveryRequest, RequestStatus
from ..models.user import User, UserRole

router = APIRouter(prefix="/disputes", tags=["disputes"])


@router.post("/", response_model=DisputePublic, status_code=status.HTTP_201_CREATED)
def raise_dispute(
    payload: DisputeCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = session.get(DeliveryRequest, payload.request_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.id not in (task.sender_id, task.courier_id):
        raise HTTPException(status_code=403, detail="Not a participant of this delivery")

    dispute = Dispute(**payload.model_dump(), raised_by=current_user.id)
    task.status = RequestStatus.DISPUTED
    session.add(dispute)
    session.add(task)
    session.commit()
    session.refresh(dispute)
    return dispute


@router.get("/", response_model=list[DisputePublic])
def list_disputes(
    session: Session = Depends(get_session),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    return session.exec(select(Dispute)).all()


@router.patch("/{dispute_id}/resolve", response_model=DisputePublic)
def resolve_dispute(
    dispute_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    dispute = session.get(Dispute, dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute not found")

    dispute.resolved = True
    session.add(dispute)
    session.commit()
    session.refresh(dispute)
    return dispute
