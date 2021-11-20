from typing import List
from fastapi import FastAPI, WebSocket
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


class Notifier:
    def __init__(self):
        self.connections: List[WebSocket] = []
        self.generator = self.get_notification_generator()

    async def get_notification_generator(self):
        while True:
            message = yield
            await self._notify(message)

    async def push(self, msg: str):
        await self.generator.asend(msg)

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.connections.append(websocket)

    def remove(self, websocket: WebSocket):
        self.connections.remove(websocket)

    async def _notify(self, message: str):
        living_connections = []
        while len(self.connections) > 0:
            # Looping like this is necessary in case a disconnection is handled
            # during await websocket.send_text(message)
            websocket = self.connections.pop()
            await websocket.send_json({"event": "notification", "payload": {"message": message}})
            living_connections.append(websocket)
        self.connections = living_connections


notifier = Notifier()


@app.on_event("startup")
async def startup():
    # Prime the push notification generator
    await notifier.generator.asend(None)


@app.websocket("/gateway")
async def gateway(websocket: WebSocket):
    await notifier.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await notifier.push(data)
    except WebSocketDisconnect:
        notifier.remove(websocket)
