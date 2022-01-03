import asyncio

from api.api.v1.api import api_router
from api.core import http_session
from api.core import redis
from api.core.config import settings
from api.core.emitter import Emitter
from api.core.rabbitmq import consume
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

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


@app.on_event('startup')
async def pubsub():
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(consume(loop))


@app.on_event('shutdown')
async def shutdown():
    await http_session.close()
