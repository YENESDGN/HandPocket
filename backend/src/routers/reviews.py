from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from ..database import get_session
from ..security import get_current_user
from ..models.review import Review, ReviewCreate, ReviewPublic
from ..models.task_model import DeliveryRequest, RequestStatus
from ..models.user import User

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/", response_model=ReviewPublic, status_code=status.HTTP_201_CREATED)
def create_review(
    payload: ReviewCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    task = session.get(DeliveryRequest, payload.request_id)
    if not task or task.status != RequestStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review a completed delivery")

    if current_user.id not in (task.sender_id, task.courier_id):
        raise HTTPException(status_code=403, detail="Not a participant of this delivery")

    already_reviewed = session.exec(
        select(Review).where(
            Review.request_id == payload.request_id,
            Review.reviewer_id == current_user.id,
        )
    ).first()
    if already_reviewed:
        raise HTTPException(status_code=400, detail="Already submitted a review for this delivery")

    review = Review(**payload.model_dump(), reviewer_id=current_user.id)
    session.add(review)

    # Recalculate reviewee's average rating
    reviewee = session.get(User, payload.reviewee_id)
    if reviewee:
        existing_scores = session.exec(
            select(Review).where(Review.reviewee_id == payload.reviewee_id)
        ).all()
        total = sum(r.score for r in existing_scores) + payload.score
        reviewee.average_rating = total / (len(existing_scores) + 1)
        session.add(reviewee)

    session.commit()
    session.refresh(review)
    return review


@router.get("/user/{user_id}", response_model=list[ReviewPublic])
def get_user_reviews(
    user_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(get_current_user),
):
    return session.exec(select(Review).where(Review.reviewee_id == user_id)).all()
