import aioredis
from .emitter import Emitter

redis = aioredis.from_url('redis://localhost')
emitter = Emitter(redis)
