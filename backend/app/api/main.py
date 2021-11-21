from api.core.emitter import Emitter
from api.core import redis
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from api.api.v1.api import api_router
from api.core.config import settings
from starlette.websockets import WebSocketDisconnect

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin)
                       for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)
emitter = Emitter(redis)


@app.get('/')
async def root():
    await emitter.emit("root")
    return "emitted"
