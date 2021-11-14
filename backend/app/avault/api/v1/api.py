from sys import prefix
from fastapi import APIRouter

from avault.api.v1.endpoints import auth, channels, users, guilds, invites

api_router = APIRouter()
api_router.include_router(auth.router, prefix='/auth', tags=["login"])
api_router.include_router(
    channels.router, prefix="/channels", tags=["channels"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(guilds.router, prefix="/guilds", tags=["guilds"])
api_router.include_router(invites.router, prefix='/invites', tags=["invites"])
