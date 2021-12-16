import enum
from typing import Optional
from xml.dom import ValidationErr
from api.core.config import settings
from api.models.user import User
from fastapi import APIRouter, Query
from api.api import deps
from api.core import http_session
from fastapi.param_functions import Depends
from pydantic import ValidationError
from pydantic.main import BaseModel
import urllib.parse


router = APIRouter()


class ShareBody(BaseModel):
    id: str
    search_term: str


def make_response(result, media_type):
    return {
        "gif_src": result["media"][0]["gif"]["url"],
        "width": result["media"][0][media_type]["dims"][0],
        "height": result["media"][0][media_type]["dims"][1],
        "id": result["id"],
        "title": result["title"],
        "preview": result["media"][0][media_type]["preview"],
        "url": result["itemurl"],
    }


class MediaTypes(str, enum.Enum):
    nanomp4 = "nanomp4"
    tinygif = "tinygif"
    tinymp4 = "tinymp4"
    gif = "gif"
    mp4 = "mp4"
    nanogif = "nanogif"


class MediaType(BaseModel):
    media_format: Optional[MediaTypes] = MediaTypes.mp4


@router.get("/search")
async def search_gifs(q: str,
                      locale: str = "en_US",
                      media_format: str = MediaTypes.mp4):
    media_type = None
    try:
        media_type = MediaTypes(media_format)
    except (ValidationError, ValueError):
        media_type = MediaTypes.mp4
    async with http_session.get(f"{settings.TENOR_BASE_URL}/search?" + urllib.parse.urlencode({
        "q": q,
        "key": settings.TENOR_API_KEY,
        "limit": 50,
        "locale": locale,
        "media_filter": "basic",
    })) as response:

        json = await response.json()

        response_obj = [make_response(result, media_type)
                        for result in json['results']]

        return response_obj


@router.post("/share", status_code=204)
async def share_gif(body: ShareBody,
                    current_user: User = Depends(deps.get_current_user)):
    async with http_session.get(f"{settings.TENOR_BASE_URL}/registershare?" + urllib.parse.urlencode({
        "id": body.id, "key": settings.TENOR_API_KEY, "q": body.search_term
    })):
        return


@router.get("/categories")
async def get_categories(
        locale: str = "en_US"):
    async with http_session.get(f"{settings.TENOR_BASE_URL}/categories?" + urllib.parse.urlencode({
        "locale": locale,
        "key": settings.TENOR_API_KEY,
        "type": "featured",
    })) as response:
        json = await response.json()
        response_obj = [{
            "name": tags["searchterm"],
            "src": tags["image"]
        } for tags in json['tags']]
        return response_obj


@router.get("/trending")
async def get_trending_gifs(
        locale: str = "en_US",
        media_format: str = MediaTypes.mp4):
    media_type = None
    try:
        media_type = MediaTypes(media_format)
    except (ValidationError, ValueError):
        media_type = MediaTypes.mp4
    async with http_session.get(f"{settings.TENOR_BASE_URL}/trending?" + urllib.parse.urlencode({
        "key": settings.TENOR_API_KEY,
        "locale": locale,
        "media_filter": "basic",
        "limit": 50
    })) as response:
        json = await response.json()

        response_obj = [make_response(result, media_type)
                        for result in json['results']]

        return response_obj


@router.get("/suggest")
async def get_search_suggestions(q: str, locale: str = "en_US", limit: int = 5):
    async with http_session.get(f"{settings.TENOR_BASE_URL}/search_suggestions?" + urllib.parse.urlencode({
        "key": settings.TENOR_API_KEY, 
        "q": q,
        "locale": locale,
        "limit": limit
    })) as response:
        json = await response.json()

        return json['results']
