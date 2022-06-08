from typing import Optional, Any

from pydantic import BaseModel


class User(BaseModel):
    id: int
    username: str
    tag: str
    avatar: Optional[str] = None
    bot: Optional[bool] = False
    _state: Any = None
