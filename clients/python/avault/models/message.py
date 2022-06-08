from typing import Optional, Any

from pydantic import BaseModel, PrivateAttr

from .channel import Channel
from .user import User


class Message(BaseModel):
    content: Optional[str] = ""
    author: User
    channel_id: str
    channel: Channel
    _state: Any = PrivateAttr()

    class Config:
        arbitrary_types_allowed = True
        underscore_attrs_are_private = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        if "_state" in kwargs:
            self._state = kwargs["_state"]
