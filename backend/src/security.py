import logging
import os
from functools import lru_cache

import jwt
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient, PyJWTError
from sqlmodel import Session

from .database import get_session

logger = logging.getLogger("handpocket.security")

bearer_scheme = HTTPBearer()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")


@lru_cache(maxsize=1)
def _jwks_client() -> PyJWKClient:
    # timeout=5: if Supabase JWKS endpoint hangs, every auth request hangs with it.
    return PyJWKClient(
        f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json",
        timeout=5,
        cache_keys=True,
    )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    session: Session = Depends(get_session),
):
    from .models.user import User

    try:
        client = _jwks_client()
        signing_key = client.get_signing_key_from_jwt(credentials.credentials)
        payload = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        user_id: str = payload.get("sub", "")
    except PyJWTError as e:
        logger.warning("auth_failure reason=invalid_token error=%s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    user = session.get(User, user_id)
    if not user:
        logger.warning("auth_failure reason=user_not_found user_id=%s", user_id)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.is_banned:
        logger.warning("auth_failure reason=banned user_id=%s", user_id)
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is banned")

    return user


def get_jwt_sub(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> str:
    """Validates JWT and returns the sub UUID without requiring a DB user row."""
    try:
        client = _jwks_client()
        signing_key = client.get_signing_key_from_jwt(credentials.credentials)
        payload = jwt.decode(
            credentials.credentials,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
        return payload.get("sub", "")
    except PyJWTError as e:
        logger.warning("auth_failure reason=invalid_token (sub-only) error=%s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def require_role(*roles: str):
    def dependency(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions",
            )
        return current_user

    return dependency
