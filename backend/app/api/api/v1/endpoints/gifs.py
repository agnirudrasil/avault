from api.core.config import settings
from api.models.user import User
from fastapi import APIRouter
from api.api import deps
from api.core import http_session
from fastapi.param_functions import Depends
from pydantic.main import BaseModel


router = APIRouter()


class ShareBody(BaseModel):
    id: str
    search_term: str


@router.get("/search")
async def search_gifs(q: str):
    async with http_session.get(f"{settings.TENOR_BASE_URL}/search?q={q}&key={settings.TENOR_API_KEY}&limit={50}&media_filter=minimal&ar_range=all") as response:
        json = await response.json()

        return json


@router.post("/share", status_code=204)
async def share_gif(body: ShareBody,
                    current_user: User = Depends(deps.get_current_user)):
    async with http_session.get(f"https://g.tenor.com/v1/registershare?id={body.id}&key={settings.TENOR_API_KEY}&q={body.search_term}"):
        return
