from typing import Optional
from pydantic import BaseModel


class Overwrite(BaseModel):
    allow: Optional[int] = 0
    deny: Optional[int] = 0
    type: int
