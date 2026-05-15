import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel import Session, select

from ..database import get_session
from ..models.user import User, UserCreate, UserPublic, UserPublicLimited, UserUpdate, UserRole
from ..security import get_current_user, get_jwt_sub, require_role

router = APIRouter(prefix="/users", tags=["users"])
limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("handpocket.users")


@router.post("/", response_model=UserPublic, status_code=201)
@limiter.limit("5/minute")
def register_user(
    request: Request,
    payload: UserCreate,
    session: Session = Depends(get_session),
    jwt_sub: str = Depends(get_jwt_sub),
):
    if payload.id != jwt_sub:
        logger.warning("register_mismatch ip=%s jwt_sub=%s payload_id=%s", request.client.host if request.client else "unknown", jwt_sub, payload.id)
        raise HTTPException(status_code=403, detail="Token subject does not match provided id")

    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(**payload.model_dump())
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserPublic)
def update_me(
    payload: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserPublicLimited)
def get_user(
    user_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/ban", response_model=UserPublic)
def toggle_ban(
    user_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_banned = not user.is_banned
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
