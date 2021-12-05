from typing import Literal, Optional
from pydantic import BaseModel


class Embeds(BaseModel):
    title: Optional[str] = ""
    type: Optional[Literal["rich", "image", "video",
                           'gifv', 'article', 'link']] = "rich"


class MessageCreate(BaseModel):
    content: Optional[str] = ""
    tts: bool = False
    embeds: Optional[list] = []
