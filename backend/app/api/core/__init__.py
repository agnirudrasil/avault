import aiohttp
import aioredis
from .emitter import Emitter

redis = aioredis.from_url('redis://localhost')
emitter = Emitter(redis)


http_session = aiohttp.ClientSession()
