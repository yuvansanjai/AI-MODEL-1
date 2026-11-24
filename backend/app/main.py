"""FastAPI Application for Thiruvalluvar AI offline educational platform.

Configures:
- Lifespan management with SQLite DB verification
- CORS middleware for local frontend (Vite/React on http://localhost:5173)
- In-memory rate limiting for sensitive endpoints
- Comprehensive exception handling
- OpenAPI documentation
"""

import os
import time
from collections import defaultdict
from contextlib import asynccontextmanager
from typing import Dict, List

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import router as api_router
from app.database import init_db, get_total_kural_count


# --------------------------------------------------------------------------
# Rate Limiter (In-Memory Sliding Window)
# --------------------------------------------------------------------------
class InMemoryRateLimiter:
    def __init__(self, requests_per_minute: int = 120):
        self.rpm = requests_per_minute
        self.window = 60.0
        self.hits: Dict[str, List[float]] = defaultdict(list)

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        timestamps = self.hits[client_ip]
        # Discard hits older than 60s
        self.hits[client_ip] = [t for t in timestamps if now - t < self.window]
        if len(self.hits[client_ip]) >= self.rpm:
            return False
        self.hits[client_ip].append(now)
        return True


rate_limiter = InMemoryRateLimiter(
    requests_per_minute=int(os.getenv("RATE_LIMIT_PER_MINUTE", "120"))
)


# --------------------------------------------------------------------------
# Lifespan
# --------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure database readiness
    init_db()
    total_kurals = get_total_kural_count()
    print(f"==================================================")
    print(f"  Thiruvalluvar AI Backend Initialized")
    print(f"  Database indexed: {total_kurals} Kurals")
    print(f"  API Docs: http://localhost:8000/docs")
    print(f"==================================================")
    yield
    # Shutdown
    print("Thiruvalluvar AI Backend shutting down.")


# --------------------------------------------------------------------------
# Application Setup
# --------------------------------------------------------------------------
app = FastAPI(
    title="Thiruvalluvar AI Backend",
    description=(
        "Offline educational platform API bringing the 1,330 couplets of Thirukkural "
        "to life with age-adaptive explanations (Child, Teenager, Adult), Tamil/English "
        "bilingual search, acoustic voice age estimation, and conversational AI."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# --------------------------------------------------------------------------
# CORS Configuration
# --------------------------------------------------------------------------
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8000")
allowed_origins = [o.strip() for o in origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------------------------------
# Rate Limiting Middleware
# --------------------------------------------------------------------------
@app.middleware("http")
async def rate_limiting_middleware(request: Request, call_next):
    # Apply rate limiting primarily on chat and voice analysis endpoints
    path = request.url.path
    if path.startswith("/api/chat") or path.startswith("/api/voice"):
        client_ip = request.client.host if request.client else "127.0.0.1"
        if not rate_limiter.is_allowed(client_ip):
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Please wait a moment before sending another request."
                },
            )
    return await call_next(request)


# --------------------------------------------------------------------------
# Exception Handlers
# --------------------------------------------------------------------------
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "path": request.url.path,
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "detail": exc.detail,
            "status_code": exc.status_code,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "detail": str(exc),
            "path": request.url.path,
        },
    )


# --------------------------------------------------------------------------
# Root & Routes
# --------------------------------------------------------------------------
@app.get("/", include_in_schema=False)
async def root():
    """Redirect root path to interactive OpenAPI documentation."""
    return RedirectResponse(url="/docs")


# Mount API routes
app.include_router(api_router)


# Entry point for direct execution: python -m app.main
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
