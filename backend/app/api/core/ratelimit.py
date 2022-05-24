import hashlib
import time
from typing import Literal

from fastapi import Response, Request, Depends, HTTPException
from limits import strategies, storage, parse
from starlette import status

from api.api.deps import reusable_oauth2
from .config import settings

memory_storage = storage.RedisStorage(f"redis://{settings.REDIS_HOST}:6379/")

fixed_window = strategies.FixedWindowRateLimiter(memory_storage)


class RateLimit:
    def __init__(self, limit_str: str,
                 limit_type: Literal["global", "shared", "user"], namespace: str = ""):
        self.item = parse(limit_str)
        self.limit_type = limit_type
        self.namespace = namespace

    async def __call__(self,
                       request: Request,
                       response: Response,
                       token: str = Depends(reusable_oauth2)):
        namespace = self.namespace
        if self.limit_type == "user":
            namespace = request.scope["path"] + ":" + request.scope["method"] + ":" + token
        elif self.limit_type == "global":
            namespace = token

        namespace = hashlib.md5(namespace.encode()).hexdigest()

        hit = fixed_window.hit(self.item, namespace)

        if self.limit_type == "user" or not hit:
            _, remaining = fixed_window.get_window_stats(self.item, namespace)

            reset_time = max(memory_storage.storage.pttl(self.item.key_for(namespace)), 0)

            headers = {
                "X-RateLimit-Limit": str(self.item.amount),
                "X-RateLimit-Remaining": str(remaining),
                "X-RateLimit-Reset": str(reset_time / 1000),
                "X-RateLimit-Reset-After": str((reset_time + int(time.time() * 1000))),
                "X-RateLimit-Bucket": namespace
            }

            if not hit:
                headers.update({
                    "X-RateLimit-Global": "true" if self.limit_type == "global" else "false",
                    "X-RateLimit-Scope": str(self.limit_type),
                })
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    headers=headers,
                    detail={"message": "You are being rate limited",
                            "retry_after": reset_time / 1000,
                            "global": self.limit_type == "global"}
                )

            request.state.rate_limit = headers

        return
