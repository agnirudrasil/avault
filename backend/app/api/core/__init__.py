import aiohttp
import aioredis

from api.core.config import settings
from .emitter import Emitter

redis = aioredis.from_url(f'{settings.REDIS_HOST}')
emitter = Emitter(redis)

http_session = aiohttp.ClientSession(trust_env=True)
