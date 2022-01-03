import aiohttp
import aioredis

from .emitter import Emitter

redis = aioredis.from_url('redis://redis:6379')
emitter = Emitter(redis)

http_session = aiohttp.ClientSession(trust_env=True)
