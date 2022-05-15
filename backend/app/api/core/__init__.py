import aiohttp
import aioredis

from api.core.config import settings
from .emitter import Emitter

redis = aioredis.from_url(f'redis://{settings.REDIS_HOST}:6379')
emitter = Emitter(redis)

http_session = None


async def create_session():
    global http_session
    http_session = aiohttp.ClientSession(trust_env=True)
