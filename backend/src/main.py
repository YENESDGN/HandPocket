import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware

from .database import create_db_and_tables
from .routers import disputes, locations, notifications, reviews, tasks, users, wallet

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
    datefmt="%Y-%m-%dT%H:%M:%S",
)
logger = logging.getLogger("handpocket")

# ---------------------------------------------------------------------------
# Rate limiter (shared across routers via app.state)
# ---------------------------------------------------------------------------
limiter = Limiter(key_func=get_remote_address, default_limits=[])


# ---------------------------------------------------------------------------
# Middlewares
# ---------------------------------------------------------------------------
class HSTSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start) * 1000)

        level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            level,
            "request method=%s path=%s status=%d duration_ms=%d ip=%s",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request.client.host if request.client else "unknown",
        )
        return response


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="HandPocket API",
    version="1.0.0",
    description="Kargo talep, takip ve teslimat yönetim API'si",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    """Catch-all for exceptions FastAPI/Starlette did not handle.
    Ensures every error is logged through our structured logger instead of stderr,
    and never leaks tracebacks to the client."""
    logger.exception(
        "unhandled_exception method=%s path=%s ip=%s error_type=%s",
        request.method,
        request.url.path,
        request.client.host if request.client else "unknown",
        type(exc).__name__,
    )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

_ALLOWED_ORIGINS = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(HSTSMiddleware)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(tasks.router)
app.include_router(reviews.router)
app.include_router(disputes.router)
app.include_router(locations.router)
app.include_router(wallet.router)
app.include_router(notifications.router)


@app.get("/health", tags=["health"])
def health():
    from sqlmodel import text
    from .database import engine
    from fastapi.responses import JSONResponse
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {"status": "ok", "db": "ok"}
    except Exception as e:
        logger.error("health_check db_error=%s", str(e))
        return JSONResponse(status_code=503, content={"status": "degraded", "db": "unreachable"})
