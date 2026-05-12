from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..database import get_session
from ..security import get_current_user, require_role
from ..models.location import Location, LocationCreate, LocationPublic
from ..models.task_model import DeliveryRequest
from ..models.user import User, UserRole

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/", response_model=LocationPublic, status_code=201)
def post_location(
    payload: LocationCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_role(UserRole.COURIER)),
):
    """Courier pushes current coordinates every 2-3 minutes (polling model)."""
    task = session.get(DeliveryRequest, payload.task_id)
    if not task or task.courier_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your task")

    pin = Location(**payload.model_dump(), courier_id=current_user.id)
    session.add(pin)
    session.commit()
    session.refresh(pin)
    return pin


@router.get("/{task_id}/latest", response_model=LocationPublic)
def get_latest_location(
    task_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """Sender/Admin polls this endpoint to get the courier's last known position."""
    task = session.get(DeliveryRequest, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.id not in (task.sender_id, task.courier_id) and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")

    pin = session.exec(
        select(Location)
        .where(Location.task_id == task_id)
        .order_by(Location.timestamp.desc())  # type: ignore[arg-type]
    ).first()
    if not pin:
        raise HTTPException(status_code=404, detail="No location data yet")
    return pin
