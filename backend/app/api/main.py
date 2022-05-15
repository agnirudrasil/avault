import asyncio
import time

from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import JSONResponse
from limits import parse
from limits.aio import storage
from limits.aio import strategies
from starlette import status
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware

from api.api.v1.api import api_router
from api.core import http_session, create_session
from api.core import redis
from api.core.config import settings
from api.core.emitter import Emitter
from api.core.rabbitmq import consume

app = FastAPI(
    title=settings.PROJECT_NAME, openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=None
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


@app.exception_handler(StarletteHTTPException)
def handle(_, exc):
    response = JSONResponse(status_code=exc.status_code,
                            content=exc.detail if isinstance(exc.detail, dict) else {'detail': exc.detail}
                            )
    if hasattr(exc, 'headers') and exc.headers:
        response.headers.update(exc.headers)

    return response


app.include_router(api_router, prefix=settings.API_V1_STR)
emitter = Emitter(redis)

memory_storage = storage.RedisStorage(f"redis://{settings.REDIS_HOST}:6379/")

fixed_window = strategies.FixedWindowRateLimiter(memory_storage)


class RateLimit:
    def __init__(self, limit_str: str, global_limit: bool = False):
        self.item = parse(limit_str)
        self.global_limit = global_limit

    async def __call__(self, response: Response):
        _, remaining = fixed_window.get_window_stats(self.item, "test")

        reset_time = max(memory_storage.storage.pttl(self.item.key_for("test")), 0)

        headers = {
            "X-RateLimit-Limit": str(self.item.amount),
            "X-RateLimit-Remaining": str(remaining),
            "X-RateLimit-Reset": str(reset_time / 1000),
            "X-RateLimit-Reset-After": str((reset_time + int(time.time() * 1000))),
            "X-RateLimit-Scope": "global" if self.global_limit else "user"
        }

        response.headers.update(headers)

        if not fixed_window.hit(self.item, "test"):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                headers=headers,
                detail={"message": "You are being rate limited",
                        "retry_after": reset_time / 1000,
                        "global": self.global_limit}
            )

        return


@app.on_event('startup')
async def pubsub():
    await create_session()
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(consume(loop))


@app.on_event('shutdown')
async def shutdown():
    await http_session.close()
