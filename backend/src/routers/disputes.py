from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import or_
from sqlmodel import Session, select
from ..database import get_session
from ..security import get_current_user, require_role
from ..models.dispute import Dispute, DisputeCreate, DisputePublic
from ..models.task_model import DeliveryRequest, RequestStatus
from ..models.user import User, UserRole
from ..services.notify import safe_notify

limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/disputes", tags=["disputes"])


@router.post("/", response_model=DisputePublic, status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
def raise_dispute(
    request: Request,
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

    other = task.courier_id if current_user.id == task.sender_id else task.sender_id
    safe_notify(
        session, other, "dispute_opened",
        "Teslimat için itiraz açıldı", "Karşı taraf bu teslimat için itiraz açtı.",
        request_id=task.id, actor_id=current_user.id,
    )
    return dispute


@router.get("/", response_model=list[DisputePublic])
def list_disputes(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    session: Session = Depends(get_session),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    stmt = (
        select(Dispute)
        .order_by(Dispute.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return session.exec(stmt).all()


@router.get("/mine", response_model=list[DisputePublic])
def list_my_disputes(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    stmt = (
        select(Dispute)
        .join(DeliveryRequest, DeliveryRequest.id == Dispute.request_id)
        .where(
            or_(
                Dispute.raised_by == current_user.id,
                DeliveryRequest.sender_id == current_user.id,
                DeliveryRequest.courier_id == current_user.id,
            )
        )
        .order_by(Dispute.created_at.desc())
    )
    return session.exec(stmt).all()


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

    safe_notify(
        session, dispute.raised_by, "dispute_resolved",
        "İtirazınız çözüldü", "Açtığınız itiraz çözümlendi olarak işaretlendi.",
        request_id=dispute.request_id, actor_id=None,
    )
    return dispute
