import asyncio

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from starlette.middleware.cors import CORSMiddleware

from api.api.v1.api import api_router
from api.core import http_session
from api.core import redis
from api.core.config import settings
from api.core.emitter import Emitter
from api.core.rabbitmq import consume

# logging.basicConfig()
# logging.getLogger('sqlalchemy.engine').setLevel(logging.INFO)

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


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    print(request.scope["method"])
    response = await call_next(request)
    if response.status_code != 429 and hasattr(request.state, "rate_limit"):
        response.headers.update(request.state.rate_limit)
    return response


@app.on_event('startup')
async def pubsub():
    loop = asyncio.get_event_loop()
    asyncio.ensure_future(consume(loop))


@app.on_event('shutdown')
async def shutdown():
    await http_session.close()
