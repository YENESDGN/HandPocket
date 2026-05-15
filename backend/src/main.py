import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import create_db_and_tables
from .routers import tasks, users, reviews, disputes, locations, wallet


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

_ALLOWED_ORIGINS = os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")

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


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
