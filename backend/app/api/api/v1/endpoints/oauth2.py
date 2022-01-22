from typing import Optional, Union

from fastapi import APIRouter
from pydantic import BaseModel
from starlette.responses import RedirectResponse

router = APIRouter()


class AuthorizeBody(BaseModel):
    permissions: Optional[Union[str, int]] = None
    guild_int: Optional[int] = None
    authorize: bool


@router.get("/authorize")
async def get_authorize(client_id: int, scopes: str, redirect_uri: Optional[str]):
    oauth_scopes = scopes.split(" ")
    return RedirectResponse(url=redirect_uri)


@router.post("/authorize")
async def authorize(client_id: int, scopes: str, redirect_uri: Optional[str], body: AuthorizeBody):
    pass
