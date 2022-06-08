from typing import Optional, Any

from pydantic import BaseModel

from .user import User


class Guild(BaseModel):
    id: str
    name: str
    icon: Optional[str]
    owner: User
    _state: Any = None
